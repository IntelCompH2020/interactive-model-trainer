package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.checkimports;

import gr.cite.intelcomp.interactivemodeltrainer.common.JsonHandlingService;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CorpusImportStatus;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.IsActive;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.Visibility;
import gr.cite.intelcomp.interactivemodeltrainer.common.scope.fake.FakeRequestScope;
import gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties;
import gr.cite.intelcomp.interactivemodeltrainer.data.CorpusImportEntity;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.checkimports.config.CheckImportsProperties;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.checkimports.hdfs.HdfsFileReader;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.checkimports.model.ParquetMetadataModel;
import gr.cite.intelcomp.interactivemodeltrainer.model.RawCorpus;
import gr.cite.intelcomp.interactivemodeltrainer.query.CorpusImportQuery;
import gr.cite.intelcomp.interactivemodeltrainer.service.corpus.RawCorpusService;
import gr.cite.tools.logging.LoggerService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.EntityTransaction;
import org.apache.commons.io.FileUtils;
import org.apache.hadoop.fs.FileStatus;
import org.apache.parquet.column.ColumnDescriptor;
import org.apache.parquet.hadoop.ParquetFileReader;
import org.apache.parquet.hadoop.metadata.ParquetMetadata;
import org.apache.parquet.hadoop.util.HadoopInputFile;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;

@Component
@Scope(ConfigurableBeanFactory.SCOPE_SINGLETON)
@EnableConfigurationProperties(CheckImportsProperties.class)
public class CheckImportsTask {

    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(CheckImportsTask.class));

    private final ApplicationContext applicationContext;
    private final HdfsFileReader hdfsFileReader;
    private final CheckImportsProperties properties;
    private final EntityManagerFactory entityManagerFactory;
    private final RawCorpusService rawCorpusService;
    private final ContainerServicesProperties containerServicesProperties;
    private final JsonHandlingService jsonHandlingService;

    public CheckImportsTask(ApplicationContext applicationContext, HdfsFileReader hdfsFileReader, CheckImportsProperties properties, RawCorpusService rawCorpusService, ContainerServicesProperties containerServicesProperties, JsonHandlingService jsonHandlingService) {
        this.applicationContext = applicationContext;
        this.entityManagerFactory = applicationContext.getBean(EntityManagerFactory.class);
        this.rawCorpusService = rawCorpusService;
        this.containerServicesProperties = containerServicesProperties;
        this.jsonHandlingService = jsonHandlingService;
        this.hdfsFileReader = hdfsFileReader.config(properties.getHdfsServiceUrl(), properties.getHdfsDataPath());
        this.properties = properties;
        if (validateConfig()) {
            long intervalSeconds = properties.getCheckIntervalInSeconds();
            logger.info("Task to check for corpora imports is scheduled to run every {} seconds", intervalSeconds);

            ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
            //GK: Fixed rate is heavily unpredictable, and it will not scale well on a very heavy workload
            scheduler.scheduleWithFixedDelay(this::process, 15, intervalSeconds, TimeUnit.SECONDS);
        }
    }

    public void process() {
        logger.trace("Check imports task running");

        List<String> importing, imported, failed;
        try (FakeRequestScope ignored = new FakeRequestScope()) {
            //Figuring out the database status
            importing = getImportRecords(CorpusImportStatus.IMPORTING).stream().map(CorpusImportEntity::getName).toList();
            if (importing.size() > 0) {
                logger.error("Imports got interrupted. Setting status to fail.");
                setImportStatus(importing, CorpusImportStatus.FAIL);
            }
            imported = getImportRecords(CorpusImportStatus.SUCCESS).stream().map(CorpusImportEntity::getName).toList();
            failed = getImportRecords(CorpusImportStatus.FAIL).stream().map(CorpusImportEntity::getName).toList();

            //Scanning the hdfs folders
            List<String> folders = hdfsFileReader.getFolders();
            for (String folder : folders) {
                if (imported.contains(folder)) {
                    logger.trace("Folder '{}' already imported. Skipping.", folder);
                    continue;
                }

                logger.trace("Reading job folder '{}'", folder);
                List<FileStatus> files = hdfsFileReader.getFolderFiles(folder);
                AtomicBoolean success = new AtomicBoolean(false);
                AtomicBoolean metadataFileFound = new AtomicBoolean(false);
                files.forEach(fileStatus -> {
                    if (fileStatus.getPath().getName().equals("_SUCCESS")) success.set(true);
                    if (fileStatus.getPath().getName().equals("metadata.json")) metadataFileFound.set(true);
                });
                if (success.get()) {
                    files = files.stream().filter(
                            fileStatus -> !fileStatus.getPath().getName().equals("_SUCCESS")
                    ).collect(Collectors.toList());
                    logger.trace("Success file found and filtered");
                    logger.trace("Found {} files", files.size());

                    if (!failed.contains(folder)) addImportRecord(folder);
                        //If the import has failed in the past, try again.
                    else setImportStatus(List.of(folder), CorpusImportStatus.IMPORTING);

                    String generatedName = "Imported_" + Instant.now().getNano();
                    Path directory = Path.of(containerServicesProperties.getCorpusService().getParquetFolder(), generatedName);
                    FileUtils.forceMkdir(new File(directory.toUri()));

                    //Gathering the corpus information and fetching parquet files
                    List<String> columns = new ArrayList<>();
                    boolean fileColumnsRead = false;
                    String name = folder;
                    int filesCount = 0;
                    long records = 0;
                    String parameters = null;
                    for (FileStatus file : files) {
                        if (file.getPath().getName().equals("metadata.json")) {
                            ParquetMetadataModel metadata = readMetadataFile(file);
                            if (metadata == null) continue;
                            if (metadata.getName() != null) name = metadata.getName();
                            if (metadata.arguments() != null) parameters = metadata.arguments().toString();
                            columns = metadata.columns();
                            records = metadata.count();
                            continue;
                        }

                        //Skipping files that are not parquet
                        if (!file.getPath().getName().endsWith(".parquet")) {
                            logger.trace("Ignoring file {}. It is not a parquet file", file.getPath().getName());
                            continue;
                        }
                        saveFile(file, generatedName);
                        filesCount++;

                        if (!fileColumnsRead && file.getLen() > 0 && !metadataFileFound.get()) {
                            ParquetFileReader reader = ParquetFileReader.open(
                                    HadoopInputFile.fromStatus(file, hdfsFileReader.getConfiguration())
                            );
                            ParquetMetadata parquetMetadata = reader.getFooter();
                            columns = parquetMetadata.getFileMetaData().getSchema().getColumns().stream().map(
                                            columnDescriptor -> columnDescriptor.toString().substring(1, columnDescriptor.toString().lastIndexOf(']')))
                                    .toList();
                            records += reader.getRecordCount();
                            fileColumnsRead = true;
                        }
                    }

                    //Aborting corpus creation since there were no valid files found
                    if (filesCount == 0) {
                        logger.trace("No parquet files found in folder {}. Skipping.", folder);
                        FileUtils.forceDelete(new File(directory.toUri()));
                        setImportStatus(List.of(folder), CorpusImportStatus.FAIL);
                        continue;
                    }

                    //Generate new corpus object to ingest it to the existing
                    RawCorpus corpus = createCorpus(name, (int) records, parameters, columns, generatedName);

                    try {
                        rawCorpusService.create(corpus, generatedName);
                        setImportStatus(List.of(folder), CorpusImportStatus.SUCCESS);
                    } catch (IOException | InterruptedException e) {
                        setImportStatus(List.of(folder), CorpusImportStatus.FAIL);
                        logger.error("Failed to persist raw corpus information");
                    }

                    logger.info("Importing of folder '{}' completed", folder);
                } else {
                    logger.trace("Skipping folder '{}'. Either no data or not successful.", folder);
                }
            }
        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
        }
    }

    private ParquetMetadataModel readMetadataFile(FileStatus file) {
        try {
            byte[] fileData = hdfsFileReader.getFileData(file);
            String json = new String(fileData, StandardCharsets.UTF_8);
            return jsonHandlingService.fromJson(ParquetMetadataModel.class, json);
        } catch (IOException e) {
            logger.error("Failed to fetch metadata file");
            return null;
        }
    }

    private void saveFile(FileStatus file, String name) {
        try {
            if (properties.getFileSizeThresholdInBytes() == 0 || file.getLen() < properties.getFileSizeThresholdInBytes()) {
                logger.trace("Downloading file from path {} with size {} bytes", file.getPath().toString(), file.getLen());
                byte[] fileData = hdfsFileReader.getFileData(file);
                logger.trace("Downloaded {} bytes", fileData.length);
                File toSave = new File(Path.of(containerServicesProperties.getCorpusService().getParquetFolder(), name, file.getPath().getName()).toUri());
                FileUtils.writeByteArrayToFile(toSave, fileData, false);
            } else {
                logger.trace("File {} has size exceeding limit of {}MB. Skipping.", file.getPath().getName(), properties.getFileSizeThresholdInMB());
            }
        } catch (IOException e) {
            logger.error("Failed to fetch and save file {}", file.getPath().toString());
        }
    }

    private RawCorpus createCorpus(String name, Integer records, String parameters, List<String> columns, String generatedName) {
        RawCorpus corpus = new RawCorpus();
        corpus.setName(name);
        corpus.setDescription(parameters == null ? "No parameters" : parameters);
        corpus.setVisibility(Visibility.Public);
        corpus.setDownload_date(new Date());
        corpus.setRecords(records);
        corpus.setSource(generatedName);
        corpus.setSchema(columns);
        return corpus;
    }

    private List<CorpusImportEntity> getImportRecords(CorpusImportStatus... status) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();

        EntityTransaction transaction = entityManager.getTransaction();
        transaction.begin();

        CorpusImportQuery query = applicationContext.getBean(CorpusImportQuery.class);
        logger.trace("Fetching running imports from the database");
        List<CorpusImportEntity> results = query.statuses(status).collect();

        transaction.commit();

        entityManager.clear();
        entityManager.close();

        return results;
    }

    private void addImportRecord(String folder) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();

        EntityTransaction transaction = entityManager.getTransaction();
        transaction.begin();

        CorpusImportEntity entity = new CorpusImportEntity();
        entity.setId(UUID.randomUUID());
        entity.setPath(Path.of(hdfsFileReader.getRootUrl(), folder).toString());
        entity.setName(folder);
        entity.setStatus(CorpusImportStatus.IMPORTING);
        entity.setCreatedAt(Instant.now());
        entity.setIsActive(IsActive.ACTIVE);
        entityManager.persist(entity);

        entityManager.flush();

        transaction.commit();

        entityManager.clear();
        entityManager.close();
    }

    private void setImportStatus(List<String> names, CorpusImportStatus status) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();

        EntityTransaction transaction = entityManager.getTransaction();
        transaction.begin();

        CorpusImportQuery query = applicationContext.getBean(CorpusImportQuery.class);
        List<CorpusImportEntity> results = query.names(names).collect();
        for (CorpusImportEntity result : results) {
            result.setStatus(status);
            result.setUpdatedAt(Instant.now());
            entityManager.merge(result);
        }

        entityManager.flush();

        transaction.commit();

        entityManager.clear();
        entityManager.close();
    }

    private boolean validateConfig() {
        try {
            Objects.requireNonNull(properties);
            if (!properties.getEnabled()) return false;
            Objects.requireNonNull(properties.getHdfsDataPath());
            if (properties.getHdfsDataPath().isBlank()) return false;
            Objects.requireNonNull(properties.getHdfsServiceUrl());
            return !properties.getHdfsServiceUrl().isBlank();
        } catch (Exception e) {
            logger.error("Configuration on task to check for new corpora imports not valid. Skipping task.");
            return false;
        }
    }

}

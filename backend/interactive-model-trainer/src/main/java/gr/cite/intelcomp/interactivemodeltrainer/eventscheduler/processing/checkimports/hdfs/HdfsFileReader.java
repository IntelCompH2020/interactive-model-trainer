package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.checkimports.hdfs;

import gr.cite.tools.logging.LoggerService;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FileStatus;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;

@Component
public class HdfsFileReader {

    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(HdfsFileReader.class));

    private URI fileName;
    private FileSystem fileSystem;

    public HdfsFileReader() {
    }

    public HdfsFileReader config(String serviceUrl, String dataPath) {
        constructURI(serviceUrl, dataPath);
        return this;
    }

    public String getRootUrl() {
        return fileName.getPath();
    }

    public List<String> getFolders() {
        try {
            initHdfsClient();
        } catch (IOException e) {
            logger.error(e.getClass().getName(), e);
        }

        List<String> data = new ArrayList<>();

        try {
            Path path = new Path(fileName);
            FileStatus[] folders = fileSystem.listStatus(path);
            for (FileStatus fileStatus : folders) {
                if (fileStatus.isDirectory()) {
                    String folderName = fileStatus.getPath().getName();
                    data.add(folderName);
                }
            }

        } catch (IOException e) {
            logger.error(e.getClass().getName(), e);
        }

        return data;
    }

    public List<FileStatus> getFolderFiles(String folder) {
        List<FileStatus> files = new ArrayList<>();
        try {
            Path path = new Path(URI.create(fileName.getPath() + "/" + folder));
            FileStatus[] folders = fileSystem.listStatus(path);
            for (FileStatus fileStatus : folders) {
                if (fileStatus.isFile()) {
                    files.add(fileStatus);
                }
            }

        } catch (IOException e) {
            logger.error(e.getClass().getName(), e);
        }
        return files;
    }

    public byte[] getFileData(FileStatus file) throws IOException {
        return fileSystem.open(file.getPath()).readAllBytes();
    }

    public Configuration getConfiguration() {
        String endpoint = fileName.getScheme() + "://" + fileName.getAuthority();
        Configuration config = new Configuration();
        config.set("fs.defaultFS", endpoint);
        config.set("fs.hdfs.impl", "org.apache.hadoop.hdfs.DistributedFileSystem");
        return config;
    }

    private void constructURI(String serviceUrl, String dataPath) {
        this.fileName = URI.create("hdfs://" + serviceUrl + "/" + dataPath);
    }

    private void initHdfsClient() throws IOException {
        logger.trace("Trying to connect with the hdfs server");
        fileSystem = FileSystem.get(getConfiguration());
        logger.trace("Connected with hdfs at '{}'", fileName.getAuthority());
    }

}

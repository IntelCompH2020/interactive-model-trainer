package gr.cite.intelcomp.interactivemodeltrainer.service.corpus;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CorpusType;
import gr.cite.intelcomp.interactivemodeltrainer.configuration.ContainerServicesProperties;
import gr.cite.intelcomp.interactivemodeltrainer.data.LogicalCorpusEntity;
import gr.cite.intelcomp.interactivemodeltrainer.data.UserEntity;
import gr.cite.intelcomp.interactivemodeltrainer.model.LogicalCorpus;
import gr.cite.intelcomp.interactivemodeltrainer.model.LogicalCorpusJson;
import gr.cite.intelcomp.interactivemodeltrainer.model.builder.LogicalCorpusBuilder;
import gr.cite.intelcomp.interactivemodeltrainer.query.UserQuery;
import gr.cite.intelcomp.interactivemodeltrainer.query.lookup.CorpusLookup;
import gr.cite.intelcomp.interactivemodeltrainer.service.docker.DockerService;
import gr.cite.tools.data.builder.BuilderFactory;
import gr.cite.tools.fieldset.BaseFieldSet;
import gr.cite.tools.logging.LoggerService;
import io.kubernetes.client.openapi.ApiException;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public class LogicalCorpusService extends CorpusService<LogicalCorpus, CorpusLookup> {

    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(LogicalCorpusService.class));
    private final ApplicationContext applicationContext;
    private final ContainerServicesProperties containerServicesProperties;

    @Autowired
    protected LogicalCorpusService(BuilderFactory builderFactory, DockerService dockerService, ApplicationContext applicationContext, ContainerServicesProperties containerServicesProperties) {
        super(builderFactory, dockerService);
        this.applicationContext = applicationContext;
        this.containerServicesProperties = containerServicesProperties;
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<LogicalCorpus> getAll(CorpusLookup lookup) throws IOException, InterruptedException, ApiException {
        lookup.setCorpusType(CorpusType.LOGICAL);
        List<LogicalCorpusEntity> data = (List<LogicalCorpusEntity>) dockerService.listCorpus(lookup);
        if (lookup.getOrder() == null || lookup.getOrder().isEmpty() || lookup.getOrder().getItems() == null || lookup.getOrder().getItems().isEmpty()) {
            return builderFactory.builder(LogicalCorpusBuilder.class).build(lookup.getProject(), data);
        }
        String orderItem = lookup.getOrder().getItems().get(0);
        if (orderItem.endsWith("creator")) {
            if (orderItem.startsWith("-")) {
                return builderFactory.builder(LogicalCorpusBuilder.class).buildSortedByOwnerDesc(lookup.getProject(), data);
            } else {
                return builderFactory.builder(LogicalCorpusBuilder.class).buildSortedByOwnerAsc(lookup.getProject(), data);
            }
        }
        return builderFactory.builder(LogicalCorpusBuilder.class).build(lookup.getProject(), data);
    }

    @Override
    public void create(LogicalCorpus logicalCorpus) throws IOException, InterruptedException, ApiException {
        LogicalCorpusJson corpus = new LogicalCorpusJson(logicalCorpus, containerServicesProperties.getCorpusService().getParquetInnerFolder());
        dockerService.createCorpus(corpus, true);
    }

    @Override
    public void patch(LogicalCorpus logicalCorpus) throws IOException, InterruptedException, ApiException {
        LogicalCorpusJson corpus = new LogicalCorpusJson(logicalCorpus, containerServicesProperties.getCorpusService().getParquetInnerFolder());
        try {
            CorpusLookup corpusLookup = new CorpusLookup();
            corpusLookup.setProject(new BaseFieldSet("id", "creator"));
            List<LogicalCorpus> corpora = getAll(corpusLookup)
                    .stream()
                    .filter(c -> {
                        if (logicalCorpus.getId() == null) {
                            logger.warn("Logical corpus with a null id was found during update.");
                            return false;
                        }
                        return logicalCorpus.getId().equals(c.getId());
                    })
                    .toList();
            String creatorUsername = corpora.get(0).getCreator();
            if (creatorUsername != null && !creatorUsername.equals("-")) {
                List<UserEntity> users = applicationContext.getBean(UserQuery.class).usernames(creatorUsername).collect();
                if (!users.isEmpty()) corpus.setCreator(users.get(0).getId().toString());
            }
            dockerService.createCorpus(corpus, false);
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
            throw e;
        }
    }
}

package gr.cite.intelcomp.interactivemodeltrainer.service.corpus;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.CorpusType;
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
import io.kubernetes.client.openapi.ApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LogicalCorpusService extends CorpusService<LogicalCorpus, CorpusLookup> {

    private final ApplicationContext applicationContext;

    @Autowired
    protected LogicalCorpusService(BuilderFactory builderFactory, DockerService dockerService, ApplicationContext applicationContext) {
        super(builderFactory, dockerService);
        this.applicationContext = applicationContext;
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
        LogicalCorpusJson corpus = new LogicalCorpusJson(logicalCorpus);
        dockerService.createCorpus(corpus, true);
    }

    @Override
    public void patch(LogicalCorpus logicalCorpus) throws IOException, InterruptedException, ApiException {
        LogicalCorpusJson corpus = new LogicalCorpusJson(logicalCorpus);
        try {
            CorpusLookup corpusLookup = new CorpusLookup();
            corpusLookup.setProject(new BaseFieldSet("id", "creator"));
            List<LogicalCorpus> corpora = getAll(corpusLookup)
                    .stream()
                    .filter(c -> logicalCorpus.getId().equals(c.getId()))
                    .collect(Collectors.toList());
            String creatorUsername = corpora.get(0).getCreator();
            if (creatorUsername != null && !creatorUsername.equals("-")) {
                List<UserEntity> users = applicationContext.getBean(UserQuery.class).usernames(creatorUsername).collect();
                if (!users.isEmpty()) corpus.setCreator(users.get(0).getId().toString());
            }
            dockerService.createCorpus(corpus, false);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

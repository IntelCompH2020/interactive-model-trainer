package gr.cite.intelcomp.interactivemodeltrainer.service.wordlist;

import gr.cite.intelcomp.interactivemodeltrainer.data.UserEntity;
import gr.cite.intelcomp.interactivemodeltrainer.data.WordListEntity;
import gr.cite.intelcomp.interactivemodeltrainer.model.Keyword;
import gr.cite.intelcomp.interactivemodeltrainer.model.WordListJson;
import gr.cite.intelcomp.interactivemodeltrainer.model.builder.KeywordBuilder;
import gr.cite.intelcomp.interactivemodeltrainer.query.UserQuery;
import gr.cite.intelcomp.interactivemodeltrainer.query.lookup.WordListLookup;
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
public class KeywordService extends WordlistService<Keyword, WordListLookup> {

    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(KeywordService.class));

    private final ApplicationContext applicationContext;

    @Autowired
    public KeywordService(BuilderFactory builderFactory, DockerService dockerService, ApplicationContext applicationContext) {
        super(builderFactory, dockerService);
        this.applicationContext = applicationContext;
    }

    @Override
    public List<Keyword> getAll(WordListLookup lookup) throws IOException, InterruptedException, ApiException {
        List<WordListEntity> data = dockerService.listWordLists(lookup);
        List<Keyword> result;
        if (lookup.getOrder() == null || lookup.getOrder().isEmpty() || lookup.getOrder().getItems() == null || lookup.getOrder().getItems().isEmpty()) {
            result = builderFactory.builder(KeywordBuilder.class).build(lookup.getProject(), data);
        } else {
            String orderItem = lookup.getOrder().getItems().get(0);
            if (orderItem.endsWith("creator")) {
                if (orderItem.startsWith("-")) {
                    result = builderFactory.builder(KeywordBuilder.class).buildSortedByOwnerDesc(lookup.getProject(), data);
                } else {
                    result = builderFactory.builder(KeywordBuilder.class).buildSortedByOwnerAsc(lookup.getProject(), data);
                }
            } else {
                result = builderFactory.builder(KeywordBuilder.class).build(lookup.getProject(), data);
            }
        }

        if (lookup.getPage() != null) {
            result = result.subList(lookup.getPage().getOffset(), Math.min(lookup.getPage().getOffset() + lookup.getPage().getSize(), result.size()));
        }

        return result;
    }

    @Override
    public void create(Keyword word) throws IOException, InterruptedException, ApiException {
        WordListJson wordList = new WordListJson(word);
        dockerService.createWordList(wordList, true);
    }

    @Override
    public void patch(Keyword word) throws IOException, InterruptedException, ApiException {
        WordListJson wordList = new WordListJson(word);
        try {
            WordListLookup wordListLookup = new WordListLookup();
            wordListLookup.setProject(new BaseFieldSet("id", "creator"));
            List<Keyword> corpora = getAll(wordListLookup)
                    .stream()
                    .filter(c -> word.getId().equals(c.getId()))
                    .toList();
            String creatorUsername = corpora.get(0).getCreator();
            if (creatorUsername != null && !creatorUsername.equals("-")) {
                List<UserEntity> users = applicationContext.getBean(UserQuery.class).usernames(creatorUsername).collect();
                if (!users.isEmpty())
                    wordList.setCreator(users.get(0).getId().toString());
            }
            dockerService.createWordList(wordList, false);
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
            throw e;
        }
    }
}

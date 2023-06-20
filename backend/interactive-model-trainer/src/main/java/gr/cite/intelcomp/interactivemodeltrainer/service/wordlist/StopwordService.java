package gr.cite.intelcomp.interactivemodeltrainer.service.wordlist;

import gr.cite.intelcomp.interactivemodeltrainer.data.UserEntity;
import gr.cite.intelcomp.interactivemodeltrainer.data.WordListEntity;
import gr.cite.intelcomp.interactivemodeltrainer.model.Stopword;
import gr.cite.intelcomp.interactivemodeltrainer.model.WordListJson;
import gr.cite.intelcomp.interactivemodeltrainer.model.builder.StopwordBuilder;
import gr.cite.intelcomp.interactivemodeltrainer.query.UserQuery;
import gr.cite.intelcomp.interactivemodeltrainer.query.lookup.WordListLookup;
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
public class StopwordService extends WordlistService<Stopword, WordListLookup> {

    private final ApplicationContext applicationContext;

    @Autowired
    public StopwordService(BuilderFactory builderFactory, DockerService dockerService, ApplicationContext applicationContext) {
        super(builderFactory, dockerService);
        this.applicationContext = applicationContext;
    }

    @Override
    public List<Stopword> getAll(WordListLookup lookup) throws IOException, InterruptedException, ApiException {
        List<WordListEntity> data = dockerService.listWordLists(lookup);
        if (lookup.getOrder() == null || lookup.getOrder().isEmpty() || lookup.getOrder().getItems() == null || lookup.getOrder().getItems().isEmpty()) {
            return builderFactory.builder(StopwordBuilder.class).build(lookup.getProject(), data);
        }
        String orderItem = lookup.getOrder().getItems().get(0);
        if (orderItem.endsWith("creator")) {
            if (orderItem.startsWith("-")) {
                return builderFactory.builder(StopwordBuilder.class).buildSortedByOwnerDesc(lookup.getProject(), data);
            } else {
                return builderFactory.builder(StopwordBuilder.class).buildSortedByOwnerAsc(lookup.getProject(), data);
            }
        }
        return builderFactory.builder(StopwordBuilder.class).build(lookup.getProject(), data);
    }

    @Override
    public void create(Stopword word) throws IOException, InterruptedException, ApiException {
        WordListJson wordList = new WordListJson(word);
        dockerService.createWordList(wordList, true);
    }

    @Override
    public void patch(Stopword word) throws IOException, InterruptedException, ApiException {
        WordListJson wordList = new WordListJson(word);
        try {
            WordListLookup wordListLookup = new WordListLookup();
            wordListLookup.setProject(new BaseFieldSet("id", "creator"));
            List<Stopword> corpora = getAll(wordListLookup)
                    .stream()
                    .filter(c -> word.getId().equals(c.getId()))
                    .collect(Collectors.toList());
            String creatorUsername = corpora.get(0).getCreator();
            if (creatorUsername != null && !creatorUsername.equals("-")) {
                List<UserEntity> users = applicationContext.getBean(UserQuery.class).usernames(creatorUsername).collect();
                if (!users.isEmpty()) wordList.setCreator(users.get(0).getId().toString());
            }
            dockerService.createWordList(wordList, false);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}

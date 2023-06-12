package gr.cite.intelcomp.interactivemodeltrainer.service.wordlist;

import gr.cite.intelcomp.interactivemodeltrainer.data.WordListEntity;
import gr.cite.intelcomp.interactivemodeltrainer.model.Stopword;
import gr.cite.intelcomp.interactivemodeltrainer.model.WordListJson;
import gr.cite.intelcomp.interactivemodeltrainer.model.builder.StopwordBuilder;
import gr.cite.intelcomp.interactivemodeltrainer.query.lookup.WordListLookup;
import gr.cite.intelcomp.interactivemodeltrainer.service.docker.DockerService;
import gr.cite.tools.data.builder.BuilderFactory;
import io.kubernetes.client.openapi.ApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public class StopwordService extends WordlistService<Stopword, WordListLookup> {

    @Autowired
    public StopwordService(BuilderFactory builderFactory, DockerService dockerService) {
        super(builderFactory, dockerService);
    }

    @Override
    public List<Stopword> getAll(WordListLookup lookup) throws IOException, InterruptedException, ApiException {
        List<WordListEntity> data = dockerService.listWordLists(lookup);
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
        dockerService.createWordList(wordList);
    }


}

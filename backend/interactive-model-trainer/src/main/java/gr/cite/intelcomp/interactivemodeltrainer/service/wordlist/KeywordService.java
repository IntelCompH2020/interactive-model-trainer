package gr.cite.intelcomp.interactivemodeltrainer.service.wordlist;

import gr.cite.intelcomp.interactivemodeltrainer.data.WordListEntity;
import gr.cite.intelcomp.interactivemodeltrainer.model.Keyword;
import gr.cite.intelcomp.interactivemodeltrainer.model.WordListJson;
import gr.cite.intelcomp.interactivemodeltrainer.model.builder.KeywordBuilder;
import gr.cite.intelcomp.interactivemodeltrainer.query.lookup.WordListLookup;
import gr.cite.intelcomp.interactivemodeltrainer.service.docker.DockerService;
import gr.cite.tools.data.builder.BuilderFactory;
import io.kubernetes.client.openapi.ApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public class KeywordService extends WordlistService<Keyword, WordListLookup> {

    @Autowired
    public KeywordService(BuilderFactory builderFactory, DockerService dockerService) {
        super(builderFactory, dockerService);
    }

    @Override
    public List<Keyword> getAll(WordListLookup lookup) throws IOException, InterruptedException, ApiException {
        List<WordListEntity> data = dockerService.listWordLists(lookup);
        return builderFactory.builder(KeywordBuilder.class).build(lookup.getProject(), data);
    }

    @Override
    public void create(Keyword word) throws IOException, InterruptedException, ApiException {
        WordListJson wordList = new WordListJson(word);
        dockerService.createWordList(wordList);
    }
}

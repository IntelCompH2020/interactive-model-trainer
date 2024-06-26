package gr.cite.intelcomp.interactivemodeltrainer.service.docker;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.ModelType;
import gr.cite.intelcomp.interactivemodeltrainer.data.CorpusEntity;
import gr.cite.intelcomp.interactivemodeltrainer.data.ModelEntity;
import gr.cite.intelcomp.interactivemodeltrainer.data.UserEntity;
import gr.cite.intelcomp.interactivemodeltrainer.data.WordListEntity;
import gr.cite.intelcomp.interactivemodeltrainer.data.topic.TopicEntity;
import gr.cite.intelcomp.interactivemodeltrainer.model.LogicalCorpusJson;
import gr.cite.intelcomp.interactivemodeltrainer.model.RawCorpus;
import gr.cite.intelcomp.interactivemodeltrainer.model.WordListJson;
import gr.cite.intelcomp.interactivemodeltrainer.model.topic.TopicSimilarity;
import gr.cite.intelcomp.interactivemodeltrainer.query.lookup.CorpusLookup;
import gr.cite.intelcomp.interactivemodeltrainer.query.lookup.ModelLookup;
import gr.cite.intelcomp.interactivemodeltrainer.query.lookup.TopicLookup;
import gr.cite.intelcomp.interactivemodeltrainer.query.lookup.WordListLookup;
import io.kubernetes.client.openapi.ApiException;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public interface DockerService {

    void createInputFileInTempFolder(String fileName, String content, String service) throws IOException;

    void deleteInputTempFileInTempFolder(String fileName, String service) throws IOException;

    List<WordListEntity> listWordLists(WordListLookup lookup) throws InterruptedException, IOException, ApiException;

    List<? extends CorpusEntity> listCorpus(CorpusLookup lookup) throws InterruptedException, IOException, ApiException;

    List<? extends ModelEntity> listModels(ModelLookup lookup, List<UserEntity> users) throws InterruptedException, IOException, ApiException;

    List<? extends ModelEntity> getModel(ModelLookup lookup, String name) throws IOException, ApiException, InterruptedException;

    void createWordList(WordListJson wordList, boolean isNew) throws IOException, InterruptedException, ApiException;

    void createCorpus(LogicalCorpusJson corpus, boolean isNew) throws IOException, InterruptedException, ApiException;

    void createCorpus(RawCorpus corpus, String generatedName) throws IOException;

    void copyWordList(String name) throws InterruptedException, IOException, ApiException;

    void copyCorpus(String name) throws InterruptedException, IOException, ApiException;

    void copyModel(ModelType modelType, String name) throws InterruptedException, IOException, ApiException;

    void renameWordList(String oldName, String newName) throws InterruptedException, IOException, ApiException;

    void renameCorpus(String oldName, String newName) throws InterruptedException, IOException, ApiException;

    void renameRawCorpus(String oldName, String newName, String source) throws IOException;

    void renameModel(ModelType modelType, String oldName, String newName) throws InterruptedException, IOException, ApiException;

    void deleteWordList(String name) throws InterruptedException, IOException, ApiException;

    void deleteCorpus(String name) throws InterruptedException, IOException, ApiException;

    void deleteModel(ModelType modelType, String name) throws InterruptedException, IOException, ApiException;

    //TOPIC MODELS

    List<TopicEntity> listTopics(String name, TopicLookup lookup) throws IOException, ApiException, InterruptedException;

    TopicSimilarity getSimilarTopics(String name, Integer pairs) throws IOException, ApiException, InterruptedException;

    void setTopicLabels(String name, ArrayList<String> labels) throws IOException, ApiException, InterruptedException;

    @Deprecated
    void fuseTopics(String name, ArrayList<Integer> topics) throws IOException, ApiException, InterruptedException;

    @Deprecated
    void sortTopics(String name) throws IOException, ApiException, InterruptedException;

    void deleteTopics(String name, ArrayList<Integer> topics) throws IOException, ApiException, InterruptedException;

    //DOMAIN MODELS



    String MANAGE_LISTS = "manageLists";
    String MANAGE_CORPUS = "manageCorpus";

    String MANAGE_MODELS = "manageModels";

}

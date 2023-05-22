package gr.cite.intelcomp.interactivemodeltrainer.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Map;

public class DocumentJsonModel {

    private Map<String, String> id;
    private Map<String, String> text;
    @JsonProperty("base_scores")
    private Map<String, Integer> baseScores;
    @JsonProperty("PUlabels")
    private Map<String, Integer> puLabels;
    private Map<String, Integer> labels;
    @JsonProperty("train_test")
    private Map<String, Integer> trainTest;
    @JsonProperty("sample_weight")
    private Map<String, Integer> sampleWeight;
    @JsonProperty("PU_score_0")
    private Map<String, Float> puScore0;
    @JsonProperty("PU_score_1")
    private Map<String, Float> puScore1;
    @JsonProperty("PU_prediction")
    private Map<String, Integer> puPrediction;
    @JsonProperty("PU_prob_pred")
    private Map<String, Float> puPredictionProbability;
    private Map<String, Integer> prediction;
    @JsonProperty("prob_pred")
    private Map<String, Float> predictionProbability;
    @JsonProperty("sampling_prob")
    private Map<String, Float> samplingProbability;
    private Map<String, String> sampler;

    public Map<String, String> getId() {
        return id;
    }

    public void setId(Map<String, String> id) {
        this.id = id;
    }

    public Map<String, String> getText() {
        return text;
    }

    public void setText(Map<String, String> text) {
        this.text = text;
    }

    public Map<String, Integer> getBaseScores() {
        return baseScores;
    }

    public void setBaseScores(Map<String, Integer> baseScores) {
        this.baseScores = baseScores;
    }

    public Map<String, Integer> getPuLabels() {
        return puLabels;
    }

    public void setPuLabels(Map<String, Integer> puLabels) {
        this.puLabels = puLabels;
    }

    public Map<String, Integer> getLabels() {
        return labels;
    }

    public void setLabels(Map<String, Integer> labels) {
        this.labels = labels;
    }

    public Map<String, Integer> getTrainTest() {
        return trainTest;
    }

    public void setTrainTest(Map<String, Integer> trainTest) {
        this.trainTest = trainTest;
    }

    public Map<String, Integer> getSampleWeight() {
        return sampleWeight;
    }

    public void setSampleWeight(Map<String, Integer> sampleWeight) {
        this.sampleWeight = sampleWeight;
    }

    public Map<String, Float> getPuScore0() {
        return puScore0;
    }

    public void setPuScore0(Map<String, Float> puScore0) {
        this.puScore0 = puScore0;
    }

    public Map<String, Float> getPuScore1() {
        return puScore1;
    }

    public void setPuScore1(Map<String, Float> puScore1) {
        this.puScore1 = puScore1;
    }

    public Map<String, Integer> getPuPrediction() {
        return puPrediction;
    }

    public void setPuPrediction(Map<String, Integer> puPrediction) {
        this.puPrediction = puPrediction;
    }

    public Map<String, Float> getPuPredictionProbability() {
        return puPredictionProbability;
    }

    public void setPuPredictionProbability(Map<String, Float> puPredictionProbability) {
        this.puPredictionProbability = puPredictionProbability;
    }

    public Map<String, Integer> getPrediction() {
        return prediction;
    }

    public void setPrediction(Map<String, Integer> prediction) {
        this.prediction = prediction;
    }

    public Map<String, Float> getPredictionProbability() {
        return predictionProbability;
    }

    public void setPredictionProbability(Map<String, Float> predictionProbability) {
        this.predictionProbability = predictionProbability;
    }

    public Map<String, Float> getSamplingProbability() {
        return samplingProbability;
    }

    public void setSamplingProbability(Map<String, Float> samplingProbability) {
        this.samplingProbability = samplingProbability;
    }

    public Map<String, String> getSampler() {
        return sampler;
    }

    public void setSampler(Map<String, String> sampler) {
        this.sampler = sampler;
    }
}

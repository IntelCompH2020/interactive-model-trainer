package gr.cite.intelcomp.interactivemodeltrainer.web.controllers;

import gr.cite.intelcomp.interactivemodeltrainer.model.DomainModel;
import gr.cite.intelcomp.interactivemodeltrainer.model.LogicalCorpus;
import gr.cite.intelcomp.interactivemodeltrainer.query.lookup.CorpusLookup;
import gr.cite.intelcomp.interactivemodeltrainer.query.lookup.ModelLookup;
import gr.cite.intelcomp.interactivemodeltrainer.service.model.DomainModelService;
import gr.cite.intelcomp.interactivemodeltrainer.web.model.QueryResult;
import gr.cite.tools.logging.LoggerService;
import io.kubernetes.client.openapi.ApiException;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping(path = "api/domain-model", produces = MediaType.APPLICATION_JSON_VALUE)
public class DomainModelController {

    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(DomainModelController.class));

    private final DomainModelService domainModelService;

    @Autowired
    public DomainModelController(DomainModelService domainModelService) {
        this.domainModelService = domainModelService;
    }

    @PostMapping("all")
    @Transactional
    public QueryResult<DomainModel> GetAll(@RequestBody ModelLookup lookup) throws InterruptedException, IOException, ApiException {
        List<DomainModel> models = domainModelService.getAll(lookup);
        return new QueryResult<>(models, models.size());
    }

}

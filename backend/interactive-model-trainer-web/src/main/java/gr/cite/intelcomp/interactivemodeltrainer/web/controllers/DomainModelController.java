package gr.cite.intelcomp.interactivemodeltrainer.web.controllers;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.ModelType;
import gr.cite.intelcomp.interactivemodeltrainer.model.DomainModel;
import gr.cite.intelcomp.interactivemodeltrainer.query.lookup.DomainModelLookup;
import gr.cite.intelcomp.interactivemodeltrainer.query.lookup.ModelLookup;
import gr.cite.intelcomp.interactivemodeltrainer.service.model.DomainModelService;
import gr.cite.intelcomp.interactivemodeltrainer.web.model.QueryResult;
import gr.cite.intelcomp.interactivemodeltrainer.web.model.RenameInfo;
import gr.cite.tools.logging.LoggerService;
import io.kubernetes.client.openapi.ApiException;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import javax.validation.Valid;
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
    public QueryResult<DomainModel> GetAll(@RequestBody DomainModelLookup lookup) throws InterruptedException, IOException, ApiException {
        List<DomainModel> models = domainModelService.getAll(lookup);
        return new QueryResult<>(models, models.size());
    }

    @PostMapping("{name}/copy")
    @Transactional
    public void Copy(@PathVariable("name") String name) throws InterruptedException, IOException, ApiException {
        domainModelService.copy(ModelType.DOMAIN, name);
    }

    @PutMapping("rename")
    @Transactional
    public void Rename(@Valid @RequestBody RenameInfo model) throws InterruptedException, IOException, ApiException {
        domainModelService.rename(ModelType.DOMAIN, model.getOldName(), model.getNewName());
    }

    @DeleteMapping("{name}/delete")
    @Transactional
    public void Delete(@PathVariable("name") String name) throws InterruptedException, IOException, ApiException {
        domainModelService.delete(ModelType.DOMAIN, name);
    }

}

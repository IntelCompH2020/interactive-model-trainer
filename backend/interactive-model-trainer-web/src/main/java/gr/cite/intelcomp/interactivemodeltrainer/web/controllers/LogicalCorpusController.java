package gr.cite.intelcomp.interactivemodeltrainer.web.controllers;

import gr.cite.intelcomp.interactivemodeltrainer.model.LogicalCorpus;
import gr.cite.intelcomp.interactivemodeltrainer.query.lookup.CorpusLookup;
import gr.cite.intelcomp.interactivemodeltrainer.service.corpus.LogicalCorpusService;
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
@RequestMapping(path = "api/logical-corpus", produces = MediaType.APPLICATION_JSON_VALUE)
public class LogicalCorpusController {

    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(LogicalCorpusController.class));

    private final LogicalCorpusService logicalCorpusService;

    @Autowired
    public LogicalCorpusController(LogicalCorpusService logicalCorpusService) {
        this.logicalCorpusService = logicalCorpusService;
    }

    @PostMapping("all")
    @Transactional
    public QueryResult<LogicalCorpus> GetAll(@RequestBody CorpusLookup lookup) throws InterruptedException, IOException, ApiException {

        //logger.debug("querying {}", Keyword.class.getSimpleName());

        //this.censorFactory.censor(KeywordCensor.class).censor(lookup.getProject());

        List<LogicalCorpus> corpus = logicalCorpusService.getAll(lookup);

        //this.auditService.track(AuditableAction.Keyword_Query, "lookup", lookup);

        return new QueryResult<>(corpus, corpus.size());

    }

    @PostMapping("create")
    @Transactional
    public void Create(@Valid @RequestBody LogicalCorpus corpus) throws InterruptedException, IOException, ApiException {
        //logger.debug(new MapLogEntry("persisting" + Keyword.class.getSimpleName()).And("model", keyword);

        logicalCorpusService.create(corpus);

        //this.auditService.track(AuditableAction.Keyword_Persist, Map.ofEntries(
        //        new AbstractMap.SimpleEntry<String, Object>("model", keyword)
        //));
    }

    @PostMapping("copy/{name}")
    @Transactional
    public void Copy(@PathVariable("name") String name) throws InterruptedException, IOException, ApiException {
        //logger.debug(new MapLogEntry("copying" + Keyword.class.getSimpleName()).And("name", name);

        logicalCorpusService.copy(name);

        //this.auditService.track(AuditableAction.Keyword_Copy, Map.ofEntries(
        //        new AbstractMap.SimpleEntry<String, Object>("name", name)
        //));
    }

    @PutMapping("rename")
    @Transactional
    public void Rename(@Valid @RequestBody RenameInfo renameInfo) throws InterruptedException, IOException, ApiException {
        logicalCorpusService.rename(renameInfo.getOldName(), renameInfo.getNewName());

        //this.auditService.track(AuditableAction.Keyword_Rename, Map.ofEntries(
        //        new AbstractMap.SimpleEntry<String, Object>("oldName", wordList.getOldName()),
        //		  new AbstractMap.SimpleEntry<String, Object>("newName", wordList.getNewName())
        //));
    }

    @DeleteMapping("delete/{name}")
    @Transactional
    public void Delete(@PathVariable("name") String name) throws InterruptedException, IOException, ApiException {
        //logger.debug(new MapLogEntry("retrieving" + Keyword.class.getSimpleName()).And("name", name));

        logicalCorpusService.delete(name);

        //this.auditService.track(AuditableAction.Keyword_Delete, "name", name);
    }
}

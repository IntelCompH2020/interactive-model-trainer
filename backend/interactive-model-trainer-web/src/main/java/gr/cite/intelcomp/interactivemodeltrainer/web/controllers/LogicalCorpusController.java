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

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import java.io.IOException;

import static gr.cite.intelcomp.interactivemodeltrainer.web.controllers.BaseController.extractQueryResultWithCount;

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
    public QueryResult<LogicalCorpus> GetAll(@RequestBody CorpusLookup lookup) {
        return extractQueryResultWithCount(l -> {
            try {
                return logicalCorpusService.getAll(l);
            } catch (IOException | InterruptedException | ApiException e) {
                throw new RuntimeException(e);
            }
        }, lookup);
    }

    @PostMapping("create")
    @Transactional
    public void Create(@Valid @RequestBody LogicalCorpus corpus) throws InterruptedException, IOException, ApiException {
        logicalCorpusService.create(corpus);
    }

    @PostMapping("patch")
    @Transactional
    public void Patch(@Valid @RequestBody LogicalCorpus corpus) throws InterruptedException, IOException, ApiException {
        logicalCorpusService.patch(corpus);
    }

    @PostMapping("copy/{name}")
    @Transactional
    public void Copy(@PathVariable("name") String name) throws InterruptedException, IOException, ApiException {
        logicalCorpusService.copy(name);
    }

    @PutMapping("rename")
    @Transactional
    public void Rename(@Valid @RequestBody RenameInfo renameInfo) throws InterruptedException, IOException, ApiException {
        logicalCorpusService.rename(renameInfo.getOldName(), renameInfo.getNewName());
    }

    @DeleteMapping("delete/{name}")
    @Transactional
    public void Delete(@PathVariable("name") String name) throws InterruptedException, IOException, ApiException {
        logicalCorpusService.delete(name);
    }
}

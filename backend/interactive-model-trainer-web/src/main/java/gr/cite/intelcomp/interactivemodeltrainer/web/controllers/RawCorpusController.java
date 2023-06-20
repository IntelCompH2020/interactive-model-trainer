package gr.cite.intelcomp.interactivemodeltrainer.web.controllers;

import gr.cite.intelcomp.interactivemodeltrainer.model.RawCorpus;
import gr.cite.intelcomp.interactivemodeltrainer.query.lookup.CorpusLookup;
import gr.cite.intelcomp.interactivemodeltrainer.service.corpus.RawCorpusService;
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

import static gr.cite.intelcomp.interactivemodeltrainer.web.controllers.BaseController.extractQueryResultWithCount;

@RestController
@RequestMapping(path = "api/raw-corpus", produces = MediaType.APPLICATION_JSON_VALUE)
public class RawCorpusController {

    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(RawCorpusController.class));

    private final RawCorpusService rawCorpusService;

    @Autowired
    public RawCorpusController(RawCorpusService rawCorpusService) {
        this.rawCorpusService = rawCorpusService;
    }

    @PostMapping("all")
    @Transactional
    public QueryResult<RawCorpus> GetAll(@RequestBody CorpusLookup lookup) {
        return extractQueryResultWithCount(l -> {
            try {
                return rawCorpusService.getAll(lookup);
            } catch (IOException | InterruptedException | ApiException e) {
                throw new RuntimeException(e);
            }
        }, lookup);
    }
}

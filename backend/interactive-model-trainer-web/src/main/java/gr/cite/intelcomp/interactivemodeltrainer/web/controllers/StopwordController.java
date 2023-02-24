package gr.cite.intelcomp.interactivemodeltrainer.web.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import gr.cite.intelcomp.interactivemodeltrainer.model.Stopword;
import gr.cite.intelcomp.interactivemodeltrainer.query.lookup.WordListLookup;
import gr.cite.intelcomp.interactivemodeltrainer.service.wordlist.StopwordService;
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
@RequestMapping(path = "api/stopwords", produces = MediaType.APPLICATION_JSON_VALUE)
public class StopwordController {

    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(StopwordController.class));
    private static final ObjectMapper mapper = new ObjectMapper();

    private final StopwordService stopwordService;

    @Autowired
    public StopwordController(StopwordService stopwordService){
        this.stopwordService = stopwordService;
    }

    @PostMapping("all")
    @Transactional
    public QueryResult<Stopword> GetAll(@RequestBody WordListLookup lookup) throws InterruptedException, IOException, ApiException {
        List<Stopword> stopwords = stopwordService.getAll(lookup);
        return new QueryResult<>(stopwords, stopwords.size());
    }

    @PostMapping("create")
    @Transactional
    public void Create(@Valid @RequestBody Stopword stopword) throws InterruptedException, IOException, ApiException {
        stopwordService.create(stopword);
    }

    @PostMapping("copy/{name}")
    @Transactional
    public void Copy(@PathVariable("name") String name) throws InterruptedException, IOException, ApiException {
        stopwordService.copy(name);
    }

    @PutMapping("rename")
    @Transactional
    public void Rename(@Valid @RequestBody RenameInfo wordList) throws InterruptedException, IOException, ApiException {
        stopwordService.rename(wordList.getOldName(), wordList.getNewName());
    }

    @DeleteMapping("delete/{name}")
    @Transactional
    public void Delete(@PathVariable("name") String name) throws InterruptedException, IOException, ApiException {
        stopwordService.delete(name);
    }

}

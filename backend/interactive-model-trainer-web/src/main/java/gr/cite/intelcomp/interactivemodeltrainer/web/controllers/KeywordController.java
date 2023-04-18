package gr.cite.intelcomp.interactivemodeltrainer.web.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import gr.cite.intelcomp.interactivemodeltrainer.model.Keyword;
import gr.cite.intelcomp.interactivemodeltrainer.query.lookup.WordListLookup;
import gr.cite.intelcomp.interactivemodeltrainer.service.wordlist.KeywordService;
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

import static gr.cite.intelcomp.interactivemodeltrainer.web.controllers.BaseController.extractQueryResultWithCount;

@RestController
@RequestMapping(path = "api/keywords", produces = MediaType.APPLICATION_JSON_VALUE)
public class KeywordController {

    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(KeywordController.class));
    private static final ObjectMapper mapper = new ObjectMapper();

    private final KeywordService keywordService;

    @Autowired
    public KeywordController(KeywordService keywordService){
        this.keywordService = keywordService;
    }

    @PostMapping("all")
    @Transactional
    public QueryResult<Keyword> GetAll(@RequestBody WordListLookup lookup) {
        return extractQueryResultWithCount(l -> {
            try {
                return keywordService.getAll(l);
            } catch (IOException | InterruptedException | ApiException e) {
                throw new RuntimeException(e);
            }
        }, lookup);
    }

    @PostMapping("create")
    @Transactional
    public void Create(@Valid @RequestBody Keyword keyword) throws InterruptedException, IOException, ApiException {
        keywordService.create(keyword);
    }

    @PostMapping("copy/{name}")
    @Transactional
    public void Copy(@PathVariable("name") String name) throws InterruptedException, IOException, ApiException {
        keywordService.copy(name);
    }

    @PutMapping("rename")
    @Transactional
    public void Rename(@Valid @RequestBody RenameInfo wordList) throws InterruptedException, IOException, ApiException {
        keywordService.rename(wordList.getOldName(), wordList.getNewName());
    }

    @DeleteMapping("delete/{name}")
    @Transactional
    public void Delete(@PathVariable("name") String name) throws InterruptedException, IOException, ApiException {
        keywordService.delete(name);
    }
}

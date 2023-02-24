package gr.cite.intelcomp.interactivemodeltrainer.web.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import gr.cite.intelcomp.interactivemodeltrainer.model.Equivalence;
import gr.cite.intelcomp.interactivemodeltrainer.query.lookup.WordListLookup;
import gr.cite.intelcomp.interactivemodeltrainer.service.wordlist.EquivalenceService;
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
@RequestMapping(path = "api/equivalencies", produces = MediaType.APPLICATION_JSON_VALUE)
public class EquivalenceController {

    private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(EquivalenceController.class));
    private static final ObjectMapper mapper = new ObjectMapper();

    private final EquivalenceService equivalenceService;

    @Autowired
    public EquivalenceController(EquivalenceService equivalenceService){
        this.equivalenceService = equivalenceService;
    }

    @PostMapping("all")
    @Transactional
    public QueryResult<Equivalence> GetAll(@RequestBody WordListLookup lookup) throws InterruptedException, IOException, ApiException {
        List<Equivalence> equivalences = equivalenceService.getAll(lookup);
        return new QueryResult<>(equivalences, equivalences.size());
    }

    @PostMapping("create")
    @Transactional
    public void Create(@Valid @RequestBody Equivalence equivalence) throws InterruptedException, IOException, ApiException {
        equivalenceService.create(equivalence);
    }

    @PostMapping("copy/{name}")
    @Transactional
    public void Copy(@PathVariable("name") String name) throws InterruptedException, IOException, ApiException {
        equivalenceService.copy(name);
    }

    @PutMapping("rename")
    @Transactional
    public void Rename(@Valid @RequestBody RenameInfo wordList) throws InterruptedException, IOException, ApiException {
        equivalenceService.rename(wordList.getOldName(), wordList.getNewName());
    }

    @DeleteMapping("delete/{name}")
    @Transactional
    public void Delete(@PathVariable("name") String name) throws InterruptedException, IOException, ApiException {
        equivalenceService.delete(name);
    }
}

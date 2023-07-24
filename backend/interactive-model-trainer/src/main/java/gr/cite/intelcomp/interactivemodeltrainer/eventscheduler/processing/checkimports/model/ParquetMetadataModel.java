package gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.processing.checkimports.model;

import java.util.HashMap;
import java.util.List;

public record ParquetMetadataModel(List<String> columns, Long count, HashMap<String, String> arguments) {

    public String getName() {
        if (arguments.get("name") == null) return arguments.get("src").substring(arguments.get("src").lastIndexOf("/"));
        return arguments.get("name");
    }

}

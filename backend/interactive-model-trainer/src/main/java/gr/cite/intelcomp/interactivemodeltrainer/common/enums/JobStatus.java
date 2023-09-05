package gr.cite.intelcomp.interactivemodeltrainer.common.enums;


import java.util.Locale;

public enum JobStatus {
    QUEUED, CANCELLED, RUNNING, FINISHED, FAILED, ERROR, KILLED;

    public static class PodPhase {
        public static final String Pending = "pending";
        public static final String Running = "running";
        public static final String Succeeded = "succeeded";
        public static final String Failed = "failed";
        public static final String Unknown = "unknown";
    }

    public static class DockerContainerStatus {
        public static final String Created = "created";
        public static final String Restarting = "restarting";
        public static final String Running = "running";
        public static final String Removing = "removing";
        public static final String Paused = "paused";
        public static final String Exited = "exited";
        public static final String Dead = "dead";
    }

    public static JobStatus podStatusToJobStatus(String podPhase) throws Exception {
        return switch (podPhase.toLowerCase(Locale.ROOT)) {
            case PodPhase.Running -> JobStatus.RUNNING;
            case PodPhase.Succeeded -> JobStatus.FINISHED;
            case PodPhase.Failed -> JobStatus.FAILED;
            case PodPhase.Unknown -> JobStatus.CANCELLED;
            case PodPhase.Pending -> JobStatus.QUEUED;
            default -> throw new Exception();
        };
    }

    public static JobStatus dockerContainerStatusToJobStatus(String podPhase) throws Exception {
        return switch (podPhase.toLowerCase(Locale.ROOT)) {
            case DockerContainerStatus.Running -> JobStatus.RUNNING;
            case DockerContainerStatus.Exited, DockerContainerStatus.Removing -> JobStatus.FINISHED;
            case DockerContainerStatus.Dead -> JobStatus.FAILED;
            case DockerContainerStatus.Paused -> JobStatus.CANCELLED;
            case DockerContainerStatus.Created -> JobStatus.QUEUED;
            default -> throw new Exception();
        };
    }

    public static JobStatus stringStatusToJobStatus(String status) throws Exception {
        return switch (status.toLowerCase(Locale.ROOT)) {
            case "running" -> JobStatus.RUNNING;
            case "finished" -> JobStatus.FINISHED;
            case "failed" -> JobStatus.FAILED;
            case "cancelled" -> JobStatus.CANCELLED;
            case "queued", "submitted" -> JobStatus.QUEUED;
            case "error" -> JobStatus.ERROR;
            case "killed" -> JobStatus.KILLED;
            default -> throw new Exception();
        };
    }

    public static boolean checkIfStatusIsActive(JobStatus status) {
        return status == JobStatus.QUEUED || status == JobStatus.RUNNING;
    }
}


package gr.cite.intelcomp.interactivemodeltrainer.common.enums;


import java.util.Locale;

public enum JobStatus {
	QUEUED, CANCELLED, RUNNING, FINISHED, FAILED, ERROR, KILLED;

	public static class PodPhase{
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
		switch (podPhase.toLowerCase(Locale.ROOT)) {
			case PodPhase.Running:
				return JobStatus.RUNNING;
			case PodPhase.Succeeded:
				return JobStatus.FINISHED;
			case PodPhase.Failed:
				return JobStatus.FAILED;
			case PodPhase.Unknown:
				return JobStatus.CANCELLED;
			case PodPhase.Pending:
				return JobStatus.QUEUED;
			default:
				throw new Exception();
		}
	}

	public static JobStatus dockerContainerStatusToJobStatus(String podPhase) throws Exception {
		switch (podPhase.toLowerCase(Locale.ROOT)) {
			case DockerContainerStatus.Running:
				return JobStatus.RUNNING;
			case DockerContainerStatus.Exited:
			case DockerContainerStatus.Removing:
				return JobStatus.FINISHED;
			case DockerContainerStatus.Dead:
				return JobStatus.FAILED;
			case DockerContainerStatus.Paused:
				return JobStatus.CANCELLED;
			case DockerContainerStatus.Created:
				return JobStatus.QUEUED;
			default:
				throw new Exception();
		}
	}

	public static JobStatus stringStatusToJobStatus(String status) throws Exception {
		switch (status.toLowerCase(Locale.ROOT)) {
			case "running":
				return JobStatus.RUNNING;
			case "finished":
				return JobStatus.FINISHED;
			case "failed":
				return JobStatus.FAILED;
			case "cancelled":
				return JobStatus.CANCELLED;
			case "queued":
			case "submitted":
				return JobStatus.QUEUED;
			case "error":
				return JobStatus.ERROR;
			case "killed":
				return JobStatus.KILLED;
			default:
				throw new Exception();
		}
	}

	public static boolean checkIfStatusIsActive(JobStatus status) {
		return (status.equals(JobStatus.QUEUED) || status.equals(JobStatus.RUNNING));
	}
}


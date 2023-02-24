package gr.cite.intelcomp.interactivemodeltrainer.web.model;

import gr.cite.tools.logging.annotation.LogSensitive;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class Account {

	public static class PrincipalInfo {

		public final static String _userId = "userId";
		public UUID userId;

		public UUID getUserId() {
			return userId;
		}

		public void setUserId(UUID userId) {
			this.userId = userId;
		}

		public final static String _subject = "subject";
		public UUID subject;

		public UUID getSubject() {
			return subject;
		}

		public void setSubject(UUID subject) {
			this.subject = subject;
		}

		public final static String _name = "name";
		@LogSensitive
		public String name;

		public String getName() {
			return name;
		}

		public void setName(String name) {
			this.name = name;
		}

		public final static String _scope = "scope";
		public List<String> scope;

		public List<String> getScope() {
			return scope;
		}

		public void setScope(List<String> scope) {
			this.scope = scope;
		}

		public final static String _client = "client";
		public String client;

		public String getClient() {
			return client;
		}

		public void setClient(String client) {
			this.client = client;
		}

		public final static String _notBefore = "notBefore";
		public Instant notBefore;

		public Instant getNotBefore() {
			return notBefore;
		}

		public void setNotBefore(Instant notBefore) {
			this.notBefore = notBefore;
		}

		public final static String _issuedAt = "issuedAt";
		public Instant issuedAt;

		public Instant getIssuedAt() {
			return issuedAt;
		}

		public void setIssuedAt(Instant issuedAt) {
			this.issuedAt = issuedAt;
		}

		public final static String _authenticatedAt = "authenticatedAt";
		public Instant authenticatedAt;

		public Instant getAuthenticatedAt() {
			return authenticatedAt;
		}

		public void setAuthenticatedAt(Instant authenticatedAt) {
			this.authenticatedAt = authenticatedAt;
		}

		public final static String _expiresAt = "expiresAt";
		public Instant expiresAt;

		public Instant getExpiresAt() {
			return expiresAt;
		}

		public void setExpiresAt(Instant expiresAt) {
			this.expiresAt = expiresAt;
		}

		public final static String _more = "more";
		@LogSensitive
		public Map<String, List<String>> more;

		public Map<String, List<String>> getMore() {
			return more;
		}

		public void setMore(Map<String, List<String>> more) {
			this.more = more;
		}
	}


	public final static String _isAuthenticated = "isAuthenticated";
	private Boolean isAuthenticated;

	public Boolean getIsAuthenticated() {
		return isAuthenticated;
	}

	public void setIsAuthenticated(Boolean authenticated) {
		isAuthenticated = authenticated;
	}

	public final static String _principal = "principal";
	private PrincipalInfo principal;

	public PrincipalInfo getPrincipal() {
		return principal;
	}

	public void setPrincipal(PrincipalInfo principal) {
		this.principal = principal;
	}

	public final static String _permissions = "permissions";
	private List<String> permissions;

	public List<String> getPermissions() {
		return permissions;
	}

	public void setPermissions(List<String> permissions) {
		this.permissions = permissions;
	}
}

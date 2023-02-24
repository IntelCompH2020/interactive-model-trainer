package gr.cite.intelcomp.interactivemodeltrainer.web.model;

import gr.cite.commons.web.authz.configuration.AuthorizationConfiguration;
import gr.cite.commons.web.oidc.principal.CurrentPrincipalResolver;
import gr.cite.commons.web.oidc.principal.MyPrincipal;
import gr.cite.commons.web.oidc.principal.extractor.ClaimExtractor;
import gr.cite.commons.web.oidc.principal.extractor.ClaimExtractorKeys;
import gr.cite.intelcomp.interactivemodeltrainer.common.scope.user.UserScope;
import gr.cite.tools.fieldset.BaseFieldSet;
import gr.cite.tools.fieldset.FieldSet;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Set;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class AccountBuilder {

	private final ClaimExtractor claimExtractor;
	private final Set<String> excludeMoreClaim;
	private final AuthorizationConfiguration authorizationConfiguration;
	private final CurrentPrincipalResolver currentPrincipalResolver;
	private final UserScope userScope;

	public AccountBuilder(ClaimExtractor claimExtractor, AuthorizationConfiguration authorizationConfiguration, CurrentPrincipalResolver currentPrincipalResolver, UserScope userScope) {
		this.claimExtractor = claimExtractor;
		this.authorizationConfiguration = authorizationConfiguration;
		this.currentPrincipalResolver = currentPrincipalResolver;
		this.userScope = userScope;
		this.excludeMoreClaim = Set.of(
				ClaimExtractorKeys.Subject,
				ClaimExtractorKeys.Name,
				ClaimExtractorKeys.Scope,
				ClaimExtractorKeys.Client,
				ClaimExtractorKeys.IssuedAt,
				ClaimExtractorKeys.NotBefore,
				ClaimExtractorKeys.AuthenticatedAt,
				ClaimExtractorKeys.ExpiresAt);
	}

	public Account build(FieldSet fields, MyPrincipal principal) {
		Account model = new Account();
		if (principal == null || !principal.isAuthenticated()) {
			model.setIsAuthenticated(false);
			return model;
		}
		model.setIsAuthenticated(true);

		FieldSet principalFields = fields.extractPrefixed(BaseFieldSet.asIndexerPrefix(Account._principal));
		if (!principalFields.isEmpty()) model.setPrincipal(new Account.PrincipalInfo());
		if (principalFields.hasField(Account.PrincipalInfo._subject)) model.getPrincipal().setSubject(this.claimExtractor.subjectUUID(principal));
		if (principalFields.hasField(Account.PrincipalInfo._userId)) model.getPrincipal().setUserId(this.userScope.getUserIdSafe());
		if (principalFields.hasField(Account.PrincipalInfo._name)) model.getPrincipal().setName(this.claimExtractor.name(principal));
		if (principalFields.hasField(Account.PrincipalInfo._scope)) model.getPrincipal().setScope(this.claimExtractor.scope(principal));
		if (principalFields.hasField(Account.PrincipalInfo._client)) model.getPrincipal().setClient(this.claimExtractor.client(principal));
		if (principalFields.hasField(Account.PrincipalInfo._issuedAt)) model.getPrincipal().setIssuedAt(this.claimExtractor.issuedAt(principal));
		if (principalFields.hasField(Account.PrincipalInfo._notBefore)) model.getPrincipal().setNotBefore(this.claimExtractor.notBefore(principal));
		if (principalFields.hasField(Account.PrincipalInfo._authenticatedAt)) model.getPrincipal().setAuthenticatedAt(this.claimExtractor.authenticatedAt(principal));
		if (principalFields.hasField(Account.PrincipalInfo._expiresAt)) model.getPrincipal().setExpiresAt(this.claimExtractor.expiresAt(principal));
		if (principalFields.hasField(Account.PrincipalInfo._more)) {
			model.getPrincipal().setMore(new HashMap<>());
			for (String key : this.claimExtractor.knownPublicKeys()) {
				if (this.excludeMoreClaim.contains(key)) continue;
				List<String> values = this.claimExtractor.asStrings(principal, key);
				if (values == null || values.size() == 0) continue;
				if (!model.getPrincipal().getMore().containsKey(key)) model.getPrincipal().getMore().put(key, new ArrayList<>());
				model.getPrincipal().getMore().get(key).addAll(values);
			}
		}

		if (fields.hasField(Account._permissions)) {
			List<String> roles = claimExtractor.roles(currentPrincipalResolver.currentPrincipal());
			Set<String> permissions = authorizationConfiguration.permissionsOfRoles(roles);
			model.setPermissions(new ArrayList<>(permissions));
		}
		return model;
	}
}

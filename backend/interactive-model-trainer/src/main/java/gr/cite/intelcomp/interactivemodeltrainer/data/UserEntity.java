package gr.cite.intelcomp.interactivemodeltrainer.data;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.IsActive;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "`user`")
public class UserEntity {
	@Id
	@Column(name = "id", columnDefinition = "uuid", updatable = false, nullable = false)
	private UUID id;
	public final static String _id = "id";

	@Column(name = "first_name", length = 200, nullable = false)
	private String firstName;
	public final static String _firstName = "firstName";

	@Column(name = "last_name", length = 200, nullable = false)
	private String lastName;
	public final static String _lastName = "lastName";


	@Column(name = "timezone", length = 200, nullable = false)
	private String timezone;
	public final static String _timezone = "timezone";

	@Column(name = "culture", length = 200, nullable = false)
	private String culture;
	public final static String _culture = "culture";

	@Column(name = "language", length = 200, nullable = false)
	private String language;
	public final static String _language = "language";

	@Column(name = "subject_id", length = 150, nullable = false)
	private String subjectId;
	public final static String _subjectId = "subjectId";

	//TODO: as integer
	@Column(name = "is_active", length = 100, nullable = false)
	@Enumerated(EnumType.STRING)
	private IsActive isActive;
	public final static String _isActive = "isActive";

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;
	public final static String _createdAt = "createdAt";

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;
	public final static String _updatedAt = "updatedAt";

	public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getTimezone() {
		return timezone;
	}

	public void setTimezone(String timezone) {
		this.timezone = timezone;
	}

	public String getCulture() {
		return culture;
	}

	public void setCulture(String culture) {
		this.culture = culture;
	}

	public String getLanguage() {
		return language;
	}

	public void setLanguage(String language) {
		this.language = language;
	}

	public String getSubjectId() {
		return subjectId;
	}

	public void setSubjectId(String subjectId) {
		this.subjectId = subjectId;
	}

	public IsActive getIsActive() {
		return isActive;
	}

	public void setIsActive(IsActive isActive) {
		this.isActive = isActive;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(Instant createdAt) {
		this.createdAt = createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(Instant updatedAt) {
		this.updatedAt = updatedAt;
	}
}

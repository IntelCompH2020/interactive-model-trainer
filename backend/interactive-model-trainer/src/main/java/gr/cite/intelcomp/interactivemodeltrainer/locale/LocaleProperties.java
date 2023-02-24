package gr.cite.intelcomp.interactivemodeltrainer.locale;


import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "locale")
public class LocaleProperties {

	private String timezone;
	public String getTimezone() {
		return timezone;
	}
	public void setTimezone(String timezone) {
		this.timezone = timezone;
	}

	private String language;
	public String getLanguage() {
		return language;
	}
	public void setLanguage(String language) {
		this.language = language;
	}

	private String culture;
	public String getCulture() {
		return culture;
	}
	public void setCulture(String culture) {
		this.culture = culture;
	}
}

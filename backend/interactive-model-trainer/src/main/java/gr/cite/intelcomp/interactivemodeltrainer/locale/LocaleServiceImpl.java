package gr.cite.intelcomp.interactivemodeltrainer.locale;

import gr.cite.intelcomp.interactivemodeltrainer.convention.ConventionService;
import gr.cite.tools.logging.LoggerService;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.time.ZoneId;
import java.util.Locale;
import java.util.TimeZone;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_SINGLETON)
public class LocaleServiceImpl implements LocaleService {
	private static final LoggerService logger = new LoggerService(LoggerFactory.getLogger(LocaleServiceImpl.class));
	private final gr.cite.intelcomp.interactivemodeltrainer.locale.LocaleProperties localeProperties;
	private final ConventionService conventionService;

	@Autowired
	public LocaleServiceImpl(gr.cite.intelcomp.interactivemodeltrainer.locale.LocaleProperties localeProperties, ConventionService conventionService) {
		this.localeProperties = localeProperties;
		this.conventionService = conventionService;
	}


	@Override
	public String timezoneName() {
		return this.localeProperties.getTimezone();
	}

	@Override
	public TimeZone timezone() {
		return TimeZone.getTimeZone(ZoneId.of(this.localeProperties.getTimezone()));
	}

	@Override
	public TimeZone timezone(String code) {
		if (this.conventionService.isNullOrEmpty(code)) return this.timezone();
		return TimeZone.getTimeZone(ZoneId.of(code));
	}

	@Override
	public TimeZone timezoneSafe(String code) {
		try {
			return this.timezone(code);
		} catch (Exception ex){
			logger.warn("tried to retrieve timezone for '"+ code +"' but failed. falling back to default", ex);
			return this.timezone();
		}
	}

	@Override
	public String cultureName() {
		return this.localeProperties.getCulture();
	}

	@Override
	public Locale culture() {
		return Locale.forLanguageTag(this.localeProperties.getCulture());
	}

	@Override
	public Locale culture(String code) {
		if (this.conventionService.isNullOrEmpty(code)) return this.culture();
		return Locale.forLanguageTag(code);
	}

	@Override
	public Locale cultureSafe(String code) {
		try {
			return this.culture(code);
		} catch (Exception ex){
			logger.warn("tried to retrieve timezone for '"+ code +"' but failed. falling back to default", ex);
			return this.culture();
		}
	}

	@Override
	public String language() {
		return this.localeProperties.getLanguage();
	}
}

package gr.cite.intelcomp.interactivemodeltrainer.locale;

import java.util.Locale;
import java.util.TimeZone;

public interface LocaleService {
	String timezoneName();
	TimeZone timezone();
	TimeZone timezone(String code);
	TimeZone timezoneSafe(String code);

	String cultureName();
	Locale culture();
	Locale culture(String code);
	Locale cultureSafe(String code);

	String language();
}

package gr.cite.intelcomp.interactivemodeltrainer.web.config;

import gr.cite.intelcomp.interactivemodeltrainer.web.scope.user.UserInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import javax.validation.Validator;

@Configuration
public class WebConfiguration implements WebMvcConfigurer {
    private final UserInterceptor userInterceptor;

    @Autowired
    public WebConfiguration(UserInterceptor userInterceptor) {
        this.userInterceptor = userInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        //int order = 1;
        registry.addWebRequestInterceptor(userInterceptor).order(1);
    }
}

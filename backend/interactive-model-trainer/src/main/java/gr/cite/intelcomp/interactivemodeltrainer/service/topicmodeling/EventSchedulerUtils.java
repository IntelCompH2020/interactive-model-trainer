package gr.cite.intelcomp.interactivemodeltrainer.service.topicmodeling;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.ScheduledEventStatus;
import gr.cite.intelcomp.interactivemodeltrainer.common.enums.ScheduledEventType;
import gr.cite.intelcomp.interactivemodeltrainer.common.scope.fake.FakeRequestScope;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.manage.ScheduledEventManageService;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.manage.ScheduledEventPublishData;
import gr.cite.intelcomp.interactivemodeltrainer.query.ScheduledEventQuery;
import org.springframework.context.ApplicationContext;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.EntityTransaction;
import java.time.Instant;
import java.util.UUID;

public final class EventSchedulerUtils {

    public static void initializeRunningTasksCheckEvent(ApplicationContext applicationContext) {
        try (FakeRequestScope ignored = new FakeRequestScope()) {
            EntityManagerFactory entityManagerFactory = applicationContext.getBean(EntityManagerFactory.class);
            EntityManager entityManager = entityManagerFactory.createEntityManager();
            EntityTransaction transaction = entityManager.getTransaction();

            transaction.begin();

            ScheduledEventQuery pendingQuery = applicationContext.getBean(ScheduledEventQuery.class)
                    .status(ScheduledEventStatus.PENDING);
            if (pendingQuery.count() == 0) {
                ScheduledEventPublishData publishData = new ScheduledEventPublishData();
                publishData.setData("{}");
                publishData.setCreatorId(new UUID(0, 0));
                publishData.setType(ScheduledEventType.CHECK_RUNNING_TRAINING_TASKS);
                publishData.setRunAt(Instant.now());
                publishData.setKey(" ");
                publishData.setKeyType(" ");
                ScheduledEventManageService scheduledEventManageService = applicationContext.getBean(ScheduledEventManageService.class);

                scheduledEventManageService.publishAsync(publishData, entityManager);
            }

            transaction.commit();

            entityManager.close();
        }
    }

}

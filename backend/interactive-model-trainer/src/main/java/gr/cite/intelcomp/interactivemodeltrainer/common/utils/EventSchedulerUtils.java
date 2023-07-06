package gr.cite.intelcomp.interactivemodeltrainer.common.utils;

import gr.cite.intelcomp.interactivemodeltrainer.common.enums.ScheduledEventType;
import gr.cite.intelcomp.interactivemodeltrainer.common.scope.fake.FakeRequestScope;
import gr.cite.intelcomp.interactivemodeltrainer.data.ScheduledEventEntity;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.manage.ScheduledEventManageService;
import gr.cite.intelcomp.interactivemodeltrainer.eventscheduler.manage.ScheduledEventPublishData;
import gr.cite.intelcomp.interactivemodeltrainer.query.ScheduledEventQuery;
import org.springframework.context.ApplicationContext;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.EntityTransaction;
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
                    .eventTypes(ScheduledEventType.CHECK_RUNNING_TASKS);
            if (pendingQuery.count() != 0) {
                pendingQuery.collect().forEach((scheduledEvent -> {
                    entityManager.remove(entityManager.find(ScheduledEventEntity.class, scheduledEvent.getId()));
                }));
            }

            ScheduledEventPublishData publishData = new ScheduledEventPublishData();
            publishData.setData("{}");
            publishData.setCreatorId(new UUID(0, 0));
            publishData.setType(ScheduledEventType.CHECK_RUNNING_TASKS);
            publishData.setRunAt(Instant.now());
            publishData.setKey(" ");
            publishData.setKeyType(" ");
            ScheduledEventManageService scheduledEventManageService = applicationContext.getBean(ScheduledEventManageService.class);

            scheduledEventManageService.publishAsync(publishData, entityManager);

            transaction.commit();

            entityManager.close();
        }
    }

}

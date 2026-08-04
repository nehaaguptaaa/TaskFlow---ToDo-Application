package com.todo.taskflow.repository;

import com.todo.taskflow.entity.Task;
import com.todo.taskflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByUser(User user);

    // for calendar view — tasks within a month/date range
    List<Task> findByUserAndDueDateBetween(User user, LocalDate startDate, LocalDate endDate);

    Optional<Task> findByIdAndUser(Long id, User user);
}
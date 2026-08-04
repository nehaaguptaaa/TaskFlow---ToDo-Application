package com.todo.taskflow.service;

import com.todo.taskflow.dto.TaskRequestDTO;
import com.todo.taskflow.dto.TaskResponseDTO;
import com.todo.taskflow.entity.Task;
import com.todo.taskflow.entity.User;
import com.todo.taskflow.enums.TaskStatus;
import com.todo.taskflow.exception.TaskNotFoundException;
import com.todo.taskflow.repository.TaskRepository;
import com.todo.taskflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    // helper — logged-in user nikalne ke liye JWT context se
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    //create task
    public TaskResponseDTO createTask(TaskRequestDTO request) {
        User user = getCurrentUser();

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.PENDING)
                .dueDate(request.getDueDate())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .user(user)
                .build();

        Task saved = taskRepository.save(task);
        return mapToResponse(saved);
    }

    //get all read
    public List<TaskResponseDTO> getAllTasks() {
        User user = getCurrentUser();
        return taskRepository.findByUser(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // calendar view — month ke tasks fetch karne ke liye
    public List<TaskResponseDTO> getTasksByDateRange(LocalDate start, LocalDate end) {
        User user = getCurrentUser();
        return taskRepository.findByUserAndDueDateBetween(user, start, end)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    //update
    public TaskResponseDTO markTask(Long id, TaskStatus status) {
        User user = getCurrentUser();
        Task task = taskRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with id: " + id));

        task.setStatus(status);
        task.setUpdatedAt(LocalDateTime.now());
        Task updated = taskRepository.save(task);
        return mapToResponse(updated);
    }

    //delete
    public void deleteTask(Long id) {
        User user = getCurrentUser();
        Task task = taskRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with id: " + id));
        taskRepository.delete(task);
    }
//connverting dto - obj entity
    private TaskResponseDTO mapToResponse(Task task) {
        return TaskResponseDTO.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .priority(task.getPriority())
                .status(task.getStatus())
                .dueDate(task.getDueDate())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
    public TaskResponseDTO updateTask(Long id, TaskRequestDTO request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // match whatever ownership check markTask()/deleteTask() already do here

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        task.setDueDate(request.getDueDate());
        task.setUpdatedAt(LocalDateTime.now());

        Task saved = taskRepository.save(task);
        return mapToResponse(saved); // reuse 
    }
}
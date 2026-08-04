package com.todo.taskflow.dto;

import com.todo.taskflow.enums.Priority;
import com.todo.taskflow.enums.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TaskRequestDTO {

    @NotBlank(message = "Title is required")
    private String title;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    private Priority priority;

    private TaskStatus status;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;
}
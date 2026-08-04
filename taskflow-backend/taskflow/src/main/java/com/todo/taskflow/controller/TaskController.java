package com.todo.taskflow.controller;

import com.todo.taskflow.dto.TaskRequestDTO;
import com.todo.taskflow.dto.TaskResponseDTO;
import com.todo.taskflow.enums.TaskStatus;
import com.todo.taskflow.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor

public class TaskController {

    private final TaskService taskService;

    //create
    @PostMapping
    public ResponseEntity<TaskResponseDTO> createTask(@Valid @RequestBody TaskRequestDTO request) {
        return ResponseEntity.ok(taskService.createTask(request));
    }

    //read
    @GetMapping
    public ResponseEntity<List<TaskResponseDTO>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    // calendar view: GET /tasks/range?start=2026-08-01&end=2026-08-31
    @GetMapping("/range")
    public ResponseEntity<List<TaskResponseDTO>> getTasksByRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(taskService.getTasksByDateRange(start, end));
    }

    //update
    @PutMapping("/{id}/mark")
    public ResponseEntity<TaskResponseDTO> markTask(@PathVariable Long id, @RequestParam TaskStatus status) {
        return ResponseEntity.ok(taskService.markTask(id, status));
    }

    //delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
    // update — full edit (title, description, priority, status, dueDate)
    @PutMapping("/{id}")
    public ResponseEntity<TaskResponseDTO> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequestDTO request) {
        return ResponseEntity.ok(taskService.updateTask(id, request));
    }
}
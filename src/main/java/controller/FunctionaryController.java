package controller;

import model.Department;
import model.Functionary;
import model.FunctionaryDTO;
import repository.DepartmentRepository;
import service.FunctionaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/functionaries")
public class FunctionaryController {

    private final FunctionaryService service;
    private final DepartmentRepository departmentRepository;

    public FunctionaryController(FunctionaryService service, DepartmentRepository departmentRepository) {
        this.service = service;
        this.departmentRepository = departmentRepository;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody FunctionaryDTO f) {
        try {
            Department dep = departmentRepository.findByName(f.department())
                    .orElseGet(() -> departmentRepository.save(new Department(f.department())));

            Functionary func = new Functionary();
            func.setName(f.name());
            func.setJobTitle(f.jobTitle());
            func.setStatus(f.status());
            func.setDepartment(dep);
            func.setBaseSal(f.baseSalary() != null ? f.baseSalary() : 100000.0);
            func.setEmail(f.email());  // NOVO

            if (f.bi() == null || f.bi().isEmpty()) {
                func.setBi("TEMP-" + System.currentTimeMillis());
            } else {
                func.setBi(f.bi());
            }

            return ResponseEntity.ok(new FunctionaryDTO(service.saveFunctionary(func)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody FunctionaryDTO f) {
        try {
            Department dep = departmentRepository.findByName(f.department())
                    .orElseGet(() -> departmentRepository.save(new Department(f.department())));

            Functionary func = new Functionary();
            func.setName(f.name());
            func.setJobTitle(f.jobTitle());
            func.setStatus(f.status());
            func.setDepartment(dep);
            func.setBaseSal(f.baseSalary() != null ? f.baseSalary() : 100000.0);
            func.setEmail(f.email());

            if (f.bi() != null && !f.bi().isEmpty()) {
                func.setBi(f.bi());
            }

            return ResponseEntity.ok(new FunctionaryDTO(service.updateFunctionary(id, func)));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<FunctionaryDTO>> listAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> searchById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.getById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            service.deleteFunctionary(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
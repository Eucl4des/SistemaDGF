package controller;

import model.Comment;
import model.Event;
import model.Relatorio;
import repository.RelatorioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/relatorios")
public class RelatorioController {

    private final RelatorioRepository repository;

    public RelatorioController(RelatorioRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Relatorio> listar() {
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<Relatorio> criar(@RequestBody Relatorio r) {
        return ResponseEntity.ok(repository.save(r));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Relatorio r) {
        return repository.findById(id).map(existing -> {
            existing.setTitulo(r.getTitulo());
            existing.setTexto(r.getTexto());
            existing.setDataHora(r.getDataHora());
            return ResponseEntity.ok(repository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }



}

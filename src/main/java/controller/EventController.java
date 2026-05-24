package controller;

import model.Event;
import model.Comment;
import repository.EventRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventRepository repository;

    public EventController(EventRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Event> listar() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> buscar(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Event> criar(@RequestBody Event event) {
        Event saved = repository.save(event);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> atualizar(@PathVariable Long id, @RequestBody Event event) {
        return repository.findById(id)
                .map(existing -> {
                    existing.setTitulo(event.getTitulo());
                    existing.setData(event.getData());
                    existing.setDescricao(event.getDescricao());
                    existing.setImagem(event.getImagem());
                    return ResponseEntity.ok(repository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<Event> adicionarComentario(@PathVariable Long id, @RequestBody Comment comment) {
        return repository.findById(id)
                .map(event -> {
                    event.getComentarios().add(comment);
                    return ResponseEntity.ok(repository.save(event));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
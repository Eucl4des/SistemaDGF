package repository;

import model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    
    // Buscar eventos a partir de uma data
    List<Event> findByDataGreaterThanEqual(String data);
    
    // Buscar eventos por título (ignorando maiúsculas/minúsculas)
    List<Event> findByTituloContainingIgnoreCase(String titulo);
}
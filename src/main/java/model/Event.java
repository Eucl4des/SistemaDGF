package model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tb_event")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    private String data;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(columnDefinition = "LONGTEXT")
    private String imagem;  // para imagem em base64

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "event_id")
    private List<Comment> comentarios = new ArrayList<>();

    // Construtores
    public Event() {}

    public Event(String titulo, String data, String descricao, String imagem) {
        this.titulo = titulo;
        this.data = data;
        this.descricao = descricao;
        this.imagem = imagem;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getData() { return data; }
    public void setData(String data) { this.data = data; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public String getImagem() { return imagem; }
    public void setImagem(String imagem) { this.imagem = imagem; }

    public List<Comment> getComentarios() { return comentarios; }
    public void setComentarios(List<Comment> comentarios) { this.comentarios = comentarios; }
}
using System.ComponentModel.DataAnnotations;

namespace PokedexAPI.Models
{
    public class Pokebola
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "El nombre de la Pokébola es obligatorio.")]
        [StringLength(50, ErrorMessage = "El nombre no puede superar los 50 caracteres.")]
        public string Nombre { get; set; } = string.Empty;

        [Required(ErrorMessage = "La efectividad es obligatoria.")]
        [StringLength(20, ErrorMessage = "La efectividad no puede superar los 20 caracteres.")]
        public string Efectividad { get; set; } = string.Empty;

        [Required(ErrorMessage = "La descripción es obligatoria.")]
        [StringLength(200, ErrorMessage = "La descripción no puede superar los 200 caracteres.")]
        public string Descripcion { get; set; } = string.Empty;
    }
}
using Microsoft.AspNetCore.Mvc;
using PokedexAPI.Models;

namespace PokedexAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PokebolasController : ControllerBase
    {

        private static List<Pokebola> pokebolas = new()
        {
            new Pokebola
            {
                Id = 1,
                Nombre = "Poké Ball",
                Efectividad = "Normal",
                Descripcion = "Pokébola básica para capturar Pokémon."
            },

            new Pokebola
            {
                Id = 2,
                Nombre = "Super Ball",
                Efectividad = "Alta",
                Descripcion = "Mayor probabilidad de captura que una Poké Ball."
            },

            new Pokebola
            {
                Id = 3,
                Nombre = "Ultra Ball",
                Efectividad = "Muy alta",
                Descripcion = "Ideal para capturar Pokémon difíciles."
            },

            new Pokebola
            {
                Id = 4,
                Nombre = "Master Ball",
                Efectividad = "100%",
                Descripcion = "Captura cualquier Pokémon sin posibilidad de fallo."
            },

            new Pokebola
            {
                Id = 5,
                Nombre = "Honor Ball",
                Efectividad = "Normal",
                Descripcion = "Pokébola de edición especial entregada como regalo."
            },

            new Pokebola
            {
                Id = 6,
                Nombre = "Lujo Ball",
                Efectividad = "Normal",
                Descripcion = "Hace que el Pokémon gane amistad más rápidamente."
            },

            new Pokebola
            {
                Id = 7,
                Nombre = "Ocaso Ball",
                Efectividad = "Muy alta",
                Descripcion = "Más efectiva en cuevas o durante la noche."
            },

            new Pokebola
            {
                Id = 8,
                Nombre = "Turno Ball",
                Efectividad = "Variable",
                Descripcion = "Aumenta su efectividad conforme avanza el combate."
            }
        };


        // GET: api/pokebolas
        [HttpGet]
        public ActionResult<List<Pokebola>> Get()
        {
            return Ok(pokebolas);
        }



        // GET: api/pokebolas/1
        [HttpGet("{id}")]
        public ActionResult<Pokebola> Get(int id)
        {
            var pokebola = pokebolas.FirstOrDefault(p => p.Id == id);


            if (pokebola == null)
            {
                return NotFound(new
                {
                    mensaje = "Pokébola no encontrada"
                });
            }


            return Ok(pokebola);
        }



        // POST: api/pokebolas
        [HttpPost]
        public ActionResult Post(Pokebola pokebola)
        {

            pokebola.Id = pokebolas.Count + 1;

            pokebolas.Add(pokebola);


            return Ok(new
            {
                mensaje = "Pokébola agregada correctamente",
                datos = pokebola
            });
        }



        // PUT: api/pokebolas/1
        [HttpPut("{id}")]
        public ActionResult Put(int id, Pokebola datos)
        {

            var pokebola = pokebolas.FirstOrDefault(p => p.Id == id);


            if (pokebola == null)
            {
                return NotFound(new
                {
                    mensaje = "Pokébola no encontrada"
                });
            }


            pokebola.Nombre = datos.Nombre;
            pokebola.Efectividad = datos.Efectividad;
            pokebola.Descripcion = datos.Descripcion;


            return Ok(new
            {
                mensaje = "Pokébola actualizada correctamente",
                datos = pokebola
            });
        }



        // DELETE: api/pokebolas/1
        [HttpDelete("{id}")]
        public ActionResult Delete(int id)
        {

            var pokebola = pokebolas.FirstOrDefault(p => p.Id == id);


            if (pokebola == null)
            {
                return NotFound(new
                {
                    mensaje = "Pokébola no encontrada"
                });
            }


            pokebolas.Remove(pokebola);


            return Ok(new
            {
                mensaje = "Pokébola eliminada correctamente"
            });
        }
    }
}
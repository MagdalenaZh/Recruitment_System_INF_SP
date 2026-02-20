using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
namespace AppilicationProcesserAPI.Entities

{
    [Index(nameof(Email), IsUnique = true)]
    [Index(nameof(UserName), IsUnique = true)]

    public class UserAccount
    {
        [Key]
        public int Id { get; set; }

        public Guid UserId { get; set; } = Guid.NewGuid();

        [Required, MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required, MaxLength(20)]
        public string UserName { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string LastName { get; set; } = string.Empty;

        [Required, MaxLength(30)]
        public string Role { get; set; } = "User";

        [Required]
        public byte[] PasswordHash { get; set; } = Array.Empty<byte>();

        [Required]
        public byte[] PasswordSalt { get; set; } = Array.Empty<byte>();
    }

}

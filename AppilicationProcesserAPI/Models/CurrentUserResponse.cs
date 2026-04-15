namespace AppilicationProcesserAPI.Models
{
    public class CurrentUserResponse
    {
        public Guid UserId { get; set; }
        public string Email { get; set; } = null!;
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Role { get; set; } = null!;
        public Guid? DepartmentId { get; set; }
        public Guid? ClubId { get; set; }
        public Guid? AdminClubId { get; set; }
    }
}

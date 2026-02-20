using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AppilicationProcesserAPI.Migrations
{
    /// <inheritdoc />
    public partial class AuthApiAndPasswordHash : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Password",
                table: "UserAccounts");

            migrationBuilder.AddColumn<byte[]>(
                name: "PasswordHash",
                table: "UserAccounts",
                type: "varbinary(max)",
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "PasswordSalt",
                table: "UserAccounts",
                type: "varbinary(max)",
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "UserAccounts",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PasswordHash",
                table: "UserAccounts");

            migrationBuilder.DropColumn(
                name: "PasswordSalt",
                table: "UserAccounts");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "UserAccounts");

            migrationBuilder.AddColumn<string>(
                name: "Password",
                table: "UserAccounts",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");
        }
    }
}

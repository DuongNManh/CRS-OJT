using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClaimRequest.DAL.Data.Entities
{
    [Table("RecoveryCodes")]
    public class RecoveryCode
    {
        [Key]
        [Required]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column("staff_id")]
        public Guid StaffId { get; set; }

        [Required]
        [Column("otp_code")]
        [StringLength(6)] // Assuming a 6-digit OTP
        public string OtpCode { get; set; }

        [Required]
        [Column("expires_at")]
        public DateTime ExpiresAt { get; set; }

        [Required]
        [Column("is_used")]
        public bool IsUsed { get; set; } = false;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("attempt_count")]
        public int AttemptCount { get; set; } = 0;

        [ForeignKey("StaffId")]
        public virtual Staff Staff { get; set; }

    }
}

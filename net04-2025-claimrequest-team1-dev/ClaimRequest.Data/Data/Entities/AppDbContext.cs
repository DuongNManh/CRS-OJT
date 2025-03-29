using Microsoft.EntityFrameworkCore;

namespace ClaimRequest.DAL.Data.Entities
{
    public class ClaimRequestDbContext : DbContext
    {
        // DbSet for ClaimChangeLog (you need to create this entity)
        public DbSet<ClaimChangeLog> ClaimChangeLogs { get; set; }

        public ClaimRequestDbContext(DbContextOptions<ClaimRequestDbContext> options)
            : base(options)
        {
        }

        public DbSet<Staff> Staffs { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectStaff> ProjectStaffs { get; set; }
        public DbSet<Claim> Claims { get; set; }
        public DbSet<ClaimApprover> ClaimApprovers { get; set; }
        public DbSet<RecoveryCode> RecoveryCodes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // set Schema Name for all tables
            modelBuilder.HasDefaultSchema("ClaimRequestDB_v2");
            base.OnModelCreating(modelBuilder);
            // Configure enum conversions to store their string representations.
            modelBuilder.Entity<Staff>()
                .Property(s => s.SystemRole)
                .HasConversion<string>();

            modelBuilder.Entity<Staff>()
                .Property(s => s.Department)
                .HasConversion<string>();

            modelBuilder.Entity<Project>()
                .Property(p => p.Status)
                .HasConversion<string>();

            modelBuilder.Entity<ProjectStaff>()
                .Property(ps => ps.ProjectRole)
                .HasConversion<string>();

            modelBuilder.Entity<Claim>()
                .Property(c => c.Status)
                .HasConversion<string>(); // e.g., "Draft" will be stored as "Draft"

            modelBuilder.Entity<Claim>()
                .Property(c => c.ClaimType)
                .HasConversion<string>(); // e.g., "Travel" will be stored as "Travel"

            modelBuilder.Entity<ClaimApprover>()
                .Property(c => c.ApproverStatus)
                .HasConversion<string>();

            // Configure the relationship for Claim.Claimer
            modelBuilder.Entity<Claim>()
                .HasOne(c => c.Claimer)
                .WithMany()
                .HasForeignKey(c => c.ClaimerId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure the relationship for Claim.Finance
            modelBuilder.Entity<Claim>()
                .HasOne(c => c.Finance)
                .WithMany()
                .HasForeignKey(c => c.FinanceId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure the relationship for Claim.Project
            modelBuilder.Entity<Claim>()
                .HasOne(c => c.Project)
                .WithMany(p => p.Claims)
                .HasForeignKey(c => c.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure the relationship for ClaimApprover (explicit join entity)
            modelBuilder.Entity<ClaimApprover>()
                .HasKey(ca => new { ca.ClaimId, ca.ApproverId });

            // Configure ClaimChangeLog relationships
            modelBuilder.Entity<ClaimChangeLog>()
                .HasOne(cl => cl.Claim)
                .WithMany(c => c.ChangeHistory)
                .HasForeignKey(cl => cl.ClaimId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RecoveryCode>()
                .HasOne(otp => otp.Staff)
                .WithMany()  // No navigation property in Staff for OTPs
                .HasForeignKey(otp => otp.StaffId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure decimal precision
            modelBuilder.Entity<Claim>()
                .Property(c => c.Amount)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Claim>()
                .Property(c => c.TotalWorkingHours)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Project>()
                .Property(p => p.Budget)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Staff>()
                .Property(s => s.Salary)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Staff>()
                .HasIndex(s => s.Email)
                .IsUnique();

            // Configure DateOnly conversions for Claim
            modelBuilder.Entity<Claim>()
                .Property(c => c.StartDate)
                .HasColumnType("date")
                .HasConversion(
                    dateOnly => dateOnly.ToDateTime(TimeOnly.MinValue),
                    dateTime => DateOnly.FromDateTime(dateTime)
                );

            modelBuilder.Entity<Claim>()
                .Property(c => c.EndDate)
                .HasColumnType("date")
                .HasConversion(
                    dateOnly => dateOnly.ToDateTime(TimeOnly.MinValue),
                    dateTime => DateOnly.FromDateTime(dateTime)
                );

            // Configure DateOnly conversions for Project
            modelBuilder.Entity<Project>()
                .Property(p => p.StartDate)
                .HasColumnType("date")
                .HasConversion(
                    dateOnly => dateOnly.ToDateTime(TimeOnly.MinValue),
                    dateTime => DateOnly.FromDateTime(dateTime)
                );

            modelBuilder.Entity<Project>()
                .Property(p => p.EndDate)
                .HasColumnType("date")
                .HasConversion<DateTime?>(
        dateOnly => dateOnly.HasValue ? dateOnly.Value.ToDateTime(TimeOnly.MinValue) : null,
        dateTime => dateTime.HasValue ? DateOnly.FromDateTime(dateTime.Value) : null
    );
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClaimRequest.DAL.Migrations
{
    /// <inheritdoc />
    public partial class InitDb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "ClaimRequestDB_v2");

            migrationBuilder.CreateTable(
                name: "Staffs",
                schema: "ClaimRequestDB_v2",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    password = table.Column<string>(type: "text", nullable: false),
                    role = table.Column<string>(type: "text", nullable: false),
                    department = table.Column<string>(type: "text", nullable: false),
                    salary = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    avatar_url = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Staffs", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Projects",
                schema: "ClaimRequestDB_v2",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    start_date = table.Column<DateTime>(type: "date", nullable: false),
                    end_date = table.Column<DateTime>(type: "date", nullable: false),
                    budget = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    project_manager_id = table.Column<Guid>(type: "uuid", nullable: false),
                    business_unit_leader_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Projects", x => x.id);
                    table.ForeignKey(
                        name: "FK_Projects_Staffs_business_unit_leader_id",
                        column: x => x.business_unit_leader_id,
                        principalSchema: "ClaimRequestDB_v2",
                        principalTable: "Staffs",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Projects_Staffs_project_manager_id",
                        column: x => x.project_manager_id,
                        principalSchema: "ClaimRequestDB_v2",
                        principalTable: "Staffs",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RecoveryCodes",
                schema: "ClaimRequestDB_v2",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    staff_id = table.Column<Guid>(type: "uuid", nullable: false),
                    otp_code = table.Column<string>(type: "character varying(6)", maxLength: 6, nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_used = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    attempt_count = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecoveryCodes", x => x.id);
                    table.ForeignKey(
                        name: "FK_RecoveryCodes_Staffs_staff_id",
                        column: x => x.staff_id,
                        principalSchema: "ClaimRequestDB_v2",
                        principalTable: "Staffs",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Claims",
                schema: "ClaimRequestDB_v2",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    claim_type = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    remark = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    create_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    update_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    total_working_hours = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    start_date = table.Column<DateTime>(type: "date", nullable: false),
                    end_date = table.Column<DateTime>(type: "date", nullable: false),
                    project_id = table.Column<Guid>(type: "uuid", nullable: true),
                    claimer_id = table.Column<Guid>(type: "uuid", nullable: false),
                    finance_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Claims", x => x.id);
                    table.ForeignKey(
                        name: "FK_Claims_Projects_project_id",
                        column: x => x.project_id,
                        principalSchema: "ClaimRequestDB_v2",
                        principalTable: "Projects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Claims_Staffs_claimer_id",
                        column: x => x.claimer_id,
                        principalSchema: "ClaimRequestDB_v2",
                        principalTable: "Staffs",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Claims_Staffs_finance_id",
                        column: x => x.finance_id,
                        principalSchema: "ClaimRequestDB_v2",
                        principalTable: "Staffs",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProjectStaffs",
                schema: "ClaimRequestDB_v2",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    project_id = table.Column<Guid>(type: "uuid", nullable: false),
                    staff_id = table.Column<Guid>(type: "uuid", nullable: false),
                    role = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectStaffs", x => x.id);
                    table.ForeignKey(
                        name: "FK_ProjectStaffs_Projects_project_id",
                        column: x => x.project_id,
                        principalSchema: "ClaimRequestDB_v2",
                        principalTable: "Projects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectStaffs_Staffs_staff_id",
                        column: x => x.staff_id,
                        principalSchema: "ClaimRequestDB_v2",
                        principalTable: "Staffs",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClaimApprovers",
                schema: "ClaimRequestDB_v2",
                columns: table => new
                {
                    claim_id = table.Column<Guid>(type: "uuid", nullable: false),
                    approver_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    decision_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClaimApprovers", x => new { x.claim_id, x.approver_id });
                    table.ForeignKey(
                        name: "FK_ClaimApprovers_Claims_claim_id",
                        column: x => x.claim_id,
                        principalSchema: "ClaimRequestDB_v2",
                        principalTable: "Claims",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClaimApprovers_Staffs_approver_id",
                        column: x => x.approver_id,
                        principalSchema: "ClaimRequestDB_v2",
                        principalTable: "Staffs",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClaimChangeLogs",
                schema: "ClaimRequestDB_v2",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    claim_id = table.Column<Guid>(type: "uuid", nullable: false),
                    message = table.Column<string>(type: "text", nullable: false),
                    changed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    changed_by = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClaimChangeLogs", x => x.id);
                    table.ForeignKey(
                        name: "FK_ClaimChangeLogs_Claims_claim_id",
                        column: x => x.claim_id,
                        principalSchema: "ClaimRequestDB_v2",
                        principalTable: "Claims",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ClaimApprovers_approver_id",
                schema: "ClaimRequestDB_v2",
                table: "ClaimApprovers",
                column: "approver_id");

            migrationBuilder.CreateIndex(
                name: "IX_ClaimChangeLogs_claim_id",
                schema: "ClaimRequestDB_v2",
                table: "ClaimChangeLogs",
                column: "claim_id");

            migrationBuilder.CreateIndex(
                name: "IX_Claims_claimer_id",
                schema: "ClaimRequestDB_v2",
                table: "Claims",
                column: "claimer_id");

            migrationBuilder.CreateIndex(
                name: "IX_Claims_finance_id",
                schema: "ClaimRequestDB_v2",
                table: "Claims",
                column: "finance_id");

            migrationBuilder.CreateIndex(
                name: "IX_Claims_project_id",
                schema: "ClaimRequestDB_v2",
                table: "Claims",
                column: "project_id");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_business_unit_leader_id",
                schema: "ClaimRequestDB_v2",
                table: "Projects",
                column: "business_unit_leader_id");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_project_manager_id",
                schema: "ClaimRequestDB_v2",
                table: "Projects",
                column: "project_manager_id");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectStaffs_project_id",
                schema: "ClaimRequestDB_v2",
                table: "ProjectStaffs",
                column: "project_id");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectStaffs_staff_id",
                schema: "ClaimRequestDB_v2",
                table: "ProjectStaffs",
                column: "staff_id");

            migrationBuilder.CreateIndex(
                name: "IX_RecoveryCodes_staff_id",
                schema: "ClaimRequestDB_v2",
                table: "RecoveryCodes",
                column: "staff_id");

            migrationBuilder.CreateIndex(
                name: "IX_Staffs_email",
                schema: "ClaimRequestDB_v2",
                table: "Staffs",
                column: "email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClaimApprovers",
                schema: "ClaimRequestDB_v2");

            migrationBuilder.DropTable(
                name: "ClaimChangeLogs",
                schema: "ClaimRequestDB_v2");

            migrationBuilder.DropTable(
                name: "ProjectStaffs",
                schema: "ClaimRequestDB_v2");

            migrationBuilder.DropTable(
                name: "RecoveryCodes",
                schema: "ClaimRequestDB_v2");

            migrationBuilder.DropTable(
                name: "Claims",
                schema: "ClaimRequestDB_v2");

            migrationBuilder.DropTable(
                name: "Projects",
                schema: "ClaimRequestDB_v2");

            migrationBuilder.DropTable(
                name: "Staffs",
                schema: "ClaimRequestDB_v2");
        }
    }
}

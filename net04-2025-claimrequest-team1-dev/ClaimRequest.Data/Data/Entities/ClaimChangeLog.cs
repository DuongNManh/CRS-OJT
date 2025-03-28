﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ClaimRequest.DAL.Data.Entities
{
    public class ClaimChangeLog
    {
        [Key]
        [Required]
        [Column("id")]
        public Guid HistoryId { get; set; }

        // Foreign key linking back to the Claim
        [ForeignKey(nameof(Claim))]
        [Required]
        [Column("claim_id")]
        public Guid ClaimId { get; set; }
        public virtual Claim Claim { get; set; }

        // Details about the change
        [Required]
        [Column("message")]
        public string Message { get; set; }

        [Column("changed_at", TypeName = "timestamp with time zone")]
        [Required]
        [DataType(DataType.DateTime)]
        public DateTime ChangedAt { get; set; }

        // Optionally, store who made the change
        [Column("changed_by")]
        public string ChangedBy { get; set; }
    }
}

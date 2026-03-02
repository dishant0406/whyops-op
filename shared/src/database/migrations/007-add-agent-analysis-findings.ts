import { DataTypes, QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const tableExists = async (tableName: string): Promise<boolean> => {
    const [results] = await queryInterface.sequelize.query(
      `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '${tableName}')`
    );
    return (results as any[])[0]?.exists === true;
  };

  const indexExists = async (tableName: string, indexName: string): Promise<boolean> => {
    const [results] = await queryInterface.sequelize.query(
      `SELECT EXISTS (SELECT FROM pg_indexes WHERE tablename = '${tableName}' AND indexname = '${indexName}')`
    );
    return (results as any[])[0]?.exists === true;
  };

  if (!(await tableExists('agent_analysis_findings'))) {
    await queryInterface.createTable('agent_analysis_findings', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      run_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'agent_analysis_runs',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      dimension: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      detail: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      severity: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
        allowNull: false,
      },
      confidence: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.5,
      },
      frequency: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      impact_score: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      evidence: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
      },
      root_cause: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      recommendation: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      patches: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });
  }

  if (!(await indexExists('agent_analysis_findings', 'agent_analysis_findings_run_id_idx'))) {
    await queryInterface.addIndex('agent_analysis_findings', ['run_id'], {
      name: 'agent_analysis_findings_run_id_idx',
    });
  }
  if (!(await indexExists('agent_analysis_findings', 'agent_analysis_findings_dimension_idx'))) {
    await queryInterface.addIndex('agent_analysis_findings', ['dimension'], {
      name: 'agent_analysis_findings_dimension_idx',
    });
  }
  if (!(await indexExists('agent_analysis_findings', 'agent_analysis_findings_severity_idx'))) {
    await queryInterface.addIndex('agent_analysis_findings', ['severity'], {
      name: 'agent_analysis_findings_severity_idx',
    });
  }
  if (!(await indexExists('agent_analysis_findings', 'agent_analysis_findings_code_idx'))) {
    await queryInterface.addIndex('agent_analysis_findings', ['code'], {
      name: 'agent_analysis_findings_code_idx',
    });
  }
  if (!(await indexExists('agent_analysis_findings', 'agent_analysis_findings_created_at_idx'))) {
    await queryInterface.addIndex('agent_analysis_findings', ['created_at'], {
      name: 'agent_analysis_findings_created_at_idx',
    });
  }
  if (!(await indexExists('agent_analysis_findings', 'agent_analysis_findings_run_dim_sev_idx'))) {
    await queryInterface.addIndex('agent_analysis_findings', ['run_id', 'dimension', 'severity'], {
      name: 'agent_analysis_findings_run_dim_sev_idx',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const tableExists = async (tableName: string): Promise<boolean> => {
    const [results] = await queryInterface.sequelize.query(
      `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '${tableName}')`
    );
    return (results as any[])[0]?.exists === true;
  };

  if (await tableExists('agent_analysis_findings')) {
    await queryInterface.dropTable('agent_analysis_findings');
  }
}

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

  if (!(await tableExists('agent_analysis_configs'))) {
    await queryInterface.createTable('agent_analysis_configs', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      project_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      environment_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'environments',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      agent_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'agents',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      cron_expr: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '0 * * * *',
      },
      timezone: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'UTC',
      },
      lookback_days: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 14,
      },
      sampling_config: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      last_run_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      next_run_at: {
        type: DataTypes.DATE,
        allowNull: true,
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

  if (!(await indexExists('agent_analysis_configs', 'agent_analysis_configs_agent_id_unique'))) {
    await queryInterface.addIndex('agent_analysis_configs', ['agent_id'], {
      unique: true,
      name: 'agent_analysis_configs_agent_id_unique',
    });
  }

  if (!(await indexExists('agent_analysis_configs', 'agent_analysis_configs_due_idx'))) {
    await queryInterface.addIndex('agent_analysis_configs', ['enabled', 'next_run_at'], {
      name: 'agent_analysis_configs_due_idx',
    });
  }

  if (!(await indexExists('agent_analysis_configs', 'agent_analysis_configs_scope_idx'))) {
    await queryInterface.addIndex('agent_analysis_configs', ['user_id', 'project_id', 'environment_id'], {
      name: 'agent_analysis_configs_scope_idx',
    });
  }

  if (!(await tableExists('agent_analysis_runs'))) {
    await queryInterface.createTable('agent_analysis_runs', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      config_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'agent_analysis_configs',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      project_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      environment_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'environments',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      agent_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'agents',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending',
      },
      window_start: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      window_end: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      trace_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      event_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      summary: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      error: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      started_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      finished_at: {
        type: DataTypes.DATE,
        allowNull: true,
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

  if (!(await indexExists('agent_analysis_runs', 'agent_analysis_runs_agent_created_idx'))) {
    await queryInterface.addIndex('agent_analysis_runs', ['agent_id', 'created_at'], {
      name: 'agent_analysis_runs_agent_created_idx',
    });
  }

  if (!(await indexExists('agent_analysis_runs', 'agent_analysis_runs_status_idx'))) {
    await queryInterface.addIndex('agent_analysis_runs', ['status'], {
      name: 'agent_analysis_runs_status_idx',
    });
  }

  if (!(await indexExists('agent_analysis_runs', 'agent_analysis_runs_config_idx'))) {
    await queryInterface.addIndex('agent_analysis_runs', ['config_id'], {
      name: 'agent_analysis_runs_config_idx',
    });
  }

  if (!(await indexExists('agent_analysis_runs', 'agent_analysis_runs_window_idx'))) {
    await queryInterface.addIndex('agent_analysis_runs', ['window_start', 'window_end'], {
      name: 'agent_analysis_runs_window_idx',
    });
  }

  if (!(await indexExists('agent_analysis_runs', 'agent_analysis_runs_scope_idx'))) {
    await queryInterface.addIndex('agent_analysis_runs', ['user_id', 'project_id', 'environment_id'], {
      name: 'agent_analysis_runs_scope_idx',
    });
  }

  if (!(await tableExists('agent_analysis_sections'))) {
    await queryInterface.createTable('agent_analysis_sections', {
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
      section_key: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      payload: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });
  }

  if (!(await indexExists('agent_analysis_sections', 'agent_analysis_sections_run_section_unique'))) {
    await queryInterface.addIndex('agent_analysis_sections', ['run_id', 'section_key'], {
      unique: true,
      name: 'agent_analysis_sections_run_section_unique',
    });
  }

  if (!(await indexExists('agent_analysis_sections', 'agent_analysis_sections_run_idx'))) {
    await queryInterface.addIndex('agent_analysis_sections', ['run_id'], {
      name: 'agent_analysis_sections_run_idx',
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

  if (await tableExists('agent_analysis_sections')) {
    await queryInterface.dropTable('agent_analysis_sections');
  }
  if (await tableExists('agent_analysis_runs')) {
    await queryInterface.dropTable('agent_analysis_runs');
  }
  if (await tableExists('agent_analysis_configs')) {
    await queryInterface.dropTable('agent_analysis_configs');
  }
}

# Database Migration Script

This script allows you to apply database migrations or initiate rollbacks using a JSON specification file. It uses the Peewee ORM and the Playhouse migrations module for database operations.

> [!TIP]
>
> For more details on the Peewee ORM and how to perform database migrations using the Playhouse migrations module, refer to the official documentation:
> [Peewee Playhouse Migrations](https://docs.peewee-orm.com/en/latest/peewee/playhouse.html#migrate)

## Getting Started

### Prerequisites

- Python 3.10+ installed on your system
- Peewee ORM (`pip install peewee`)

### Usage

To execute database migrations or rollbacks, use the following command:

```bash
python3 -m migrations.schema.run <exec_command> <spec_version>
```

- `<exec_command>`: The command to execute, either `migrate` or `rollback`.
- `<spec_version>`: The version of the migration specification file you want to apply (e.g., `v1.0.0`).

#### Example - Migrate to a specific schema version:

```bash
python3 -m migrations.schema.run migrate v1.0.0
```

#### Example - Rollback (Placeholder, not yet implemented):

```bash
python3 -m migrations.schema.run rollback v1.0.0
```

### Spec File Format

The migration specification file is a JSON file that defines the schema changes to be applied. Here's a sample format:

```json
[
  {
    "action": "add_column",
    "table": "users",
    "column_name": "age",
    "field": "IntegerField()"
  },
  {
    "action": "drop_column",
    "table": "posts",
    "column_name": "author_id",
    "cascade": true
  },
  {
    "action": "rename_column",
    "table": "posts",
    "old_name": "title",
    "new_name": "post_title"
  },
  {
    "action": "add_not_null",
    "table": "comments",
    "column": "post_id"
  },
  {
    "action": "rename_table",
    "old_name": "posts",
    "new_name": "articles"
  },
  {
    "action": "add_index",
    "table": "articles",
    "columns": ["status", "created_at"],
    "unique": true
  },
  {
    "action": "drop_index",
    "table": "comments",
    "index_name": "post_id"
  }
]
```

### Supported Actions

- `add_column`
- `drop_column`
- `rename_column`
- `add_not_null`
- `drop_not_null`
- `rename_table`
- `add_index`
- `drop_index`

Each action requires specific parameters, as mentioned in the sample spec file format.

### Rollback (Future Feature)

Currently, the rollback functionality is not implemented. Future updates will support rolling back schema changes.

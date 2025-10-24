#!/bin/bash
# ベクトルデータベースの状態を確認するスクリプト

set -e

CONTAINER_NAME="postgres"
DB_USER="postgres"
DB_NAME="ragdb"

echo "🔍 Checking vector database status..."
echo ""

# PostgreSQL コンテナが起動しているか確認
if ! docker ps | grep -q $CONTAINER_NAME; then
    echo "❌ PostgreSQL container is not running"
    echo "Run: docker-compose up -d"
    exit 1
fi

CONTAINER_ID=$(docker ps -q -f name=$CONTAINER_NAME)

echo "📊 Table Schema:"
echo "================"
docker exec $CONTAINER_ID psql -U $DB_USER -d $DB_NAME -c "\d documents"
echo ""

echo "📈 Document Count:"
echo "=================="
docker exec $CONTAINER_ID psql -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) as total_documents FROM documents;"
echo ""

echo "📋 Document List:"
echo "================="
docker exec $CONTAINER_ID psql -U $DB_USER -d $DB_NAME -c "SELECT vector_id, metadata->>'title' as title, metadata->>'category' as category, LENGTH(metadata->>'content') as content_length FROM documents;"
echo ""

echo "🎯 Vector Status:"
echo "================="
docker exec $CONTAINER_ID psql -U $DB_USER -d $DB_NAME -c "SELECT vector_id, metadata->>'title' as title, embedding IS NOT NULL as has_embedding, array_length(embedding::real[], 1) as vector_dimension FROM documents;"
echo ""

echo "🔢 Sample Vector Values (first 5 dimensions):"
echo "=============================================="
docker exec $CONTAINER_ID psql -U $DB_USER -d $DB_NAME -c "SELECT vector_id, (string_to_array(embedding::text, ','))[1:5] as first_5_values FROM documents;"
echo ""

echo "✅ Check completed!"

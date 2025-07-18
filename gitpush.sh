#!/bin/bash

# 进入你的项目路径（可选）
# cd /d/your/project/path

# 提示输入提交信息
read -p "请输入提交说明: " msg

# 执行 Git 命令
git add .
git commit -m "$msg"
git push

echo "✅ 已完成 Git 提交与推送"

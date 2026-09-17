"""Regression coverage for repository and webpage source metadata."""
import argparse
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import projects


class SourceTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        (self.root / 'projects').mkdir()
        (self.root / 'templates/project').mkdir(parents=True)
        (self.root / 'templates/project/README.md').write_text('# {{name}}\n{{repo}}', encoding='utf-8')
        (self.root / 'README.md').write_text('<!-- PROJECT_INDEX:START --><!-- PROJECT_INDEX:END -->\n<!-- PROJECT_GALLERY:START --><!-- PROJECT_GALLERY:END -->', encoding='utf-8')
        self.patch = patch.object(projects, 'ROOT', self.root)
        self.patch.start()

    def tearDown(self):
        self.patch.stop()
        self.temp.cleanup()

    def test_repository_and_webpage_keep_stable_numbers(self):
        projects.create(argparse.Namespace(slug='first', name='First', summary='Study', repo='https://github.com/example/repo', source=''))
        projects.create(argparse.Namespace(slug='second', name='Second', summary='Study', repo='', source='https://example.com/demo/'))
        items = projects.read_projects()
        self.assertEqual([p['id'] for p in items], [1, 2])
        self.assertEqual(items[1]['repo'], '')
        self.assertIn('参考网页', projects.source_link(items[1]))
        projects.sync(check=True)

    def test_missing_and_invalid_sources_rejected_without_creating_project(self):
        for repo, source in [('', ''), ('https://example.com/not-github', ''), ('', 'javascript:alert(1)')]:
            with self.assertRaises(ValueError):
                projects.create(argparse.Namespace(slug='bad', name='Bad', summary='Study', repo=repo, source=source))
        self.assertEqual(list((self.root / 'projects').iterdir()), [])


if __name__ == '__main__':
    unittest.main()

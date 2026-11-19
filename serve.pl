#!/usr/bin/perl
# Minimal static file server (core modules only) for local preview.
# Usage: perl tools/serve.pl <root> <port>
use strict;
use warnings;
use IO::Socket::INET;
use IO::File;

my ($root, $port) = @ARGV;
$root =~ s{[/\\]$}{};
$port ||= 8765;

my %mime = (
  html => "text/html; charset=utf-8",
  htm  => "text/html; charset=utf-8",
  css  => "text/css; charset=utf-8",
  js   => "text/javascript; charset=utf-8",
  mjs  => "text/javascript; charset=utf-8",
  png  => "image/png",
  jpg  => "image/jpeg",
  jpeg => "image/jpeg",
  gif  => "image/gif",
  svg  => "image/svg+xml",
  webp => "image/webp",
  ico  => "image/x-icon",
  json => "application/json",
  txt  => "text/plain; charset=utf-8",
  woff => "font/woff",
  woff2=> "font/woff2",
  ttf  => "font/ttf",
  otf  => "font/otf",
  pdf  => "application/pdf",
  mp4  => "video/mp4",
);

sub urldecode {
  my ($s) = @_;
  $s =~ tr/+/ /;
  $s =~ s/%([0-9A-Fa-f]{2})/chr(hex($1))/ge;
  return $s;
}

my $server = IO::Socket::INET->new(
  LocalAddr => "127.0.0.1",
  LocalPort => $port,
  Listen    => 32,
  ReuseAddr => 1,
  Proto     => "tcp",
) or die "cannot listen: $!\n";

print "serving $root on http://127.0.0.1:$port\n";

while (my $client = $server->accept()) {
  $client->autoflush(1);
  my $req = <$client>;
  my $method = "";
  my $path = "/";
  if (defined $req && $req =~ /^(\S+)\s+(\S+)/) {
    ($method, $path) = ($1, $2);
  }
  # Drain remaining request headers
  while (defined(my $line = <$client>)) {
    last if $line =~ /^\r?\n$/;
  }

  $path =~ s/\?.*$//;
  $path = urldecode($path);
  $path = "/index.html" if $path eq "/";
  $path = "/index.html" if $path =~ m{/$};

  my $file = $root . $path;
  $file =~ s{/}{/}g;

  # Path traversal guard
  if ($file !~ m{^\Q$root\E(/|\z)}) {
    print $client "HTTP/1.0 403 Forbidden\r\nConnection: close\r\nContent-Length: 0\r\n\r\n";
    close $client;
    next;
  }

  if (-f $file) {
    my $ext = $file =~ /\.([^.]+)$/ ? lc($1) : "";
    my $ctype = $mime{$ext} || "application/octet-stream";
    my $fh = IO::File->new($file, "r") or do {
      print $client "HTTP/1.0 404 Not Found\r\nConnection: close\r\nContent-Length: 0\r\n\r\n";
      close $client;
      next;
    };
    binmode $fh;
    local $/;
    my $body = <$fh>;
    close $fh;
    if ($method eq "HEAD") {
      print $client "HTTP/1.0 200 OK\r\nContent-Type: $ctype\r\nContent-Length: " . length($body) . "\r\nConnection: close\r\n\r\n";
    } else {
      print $client "HTTP/1.0 200 OK\r\nContent-Type: $ctype\r\nContent-Length: " . length($body) . "\r\nConnection: close\r\n\r\n$body";
    }
  } else {
    print $client "HTTP/1.0 404 Not Found\r\nConnection: close\r\nContent-Length: 0\r\n\r\n";
  }
  close $client;
}
